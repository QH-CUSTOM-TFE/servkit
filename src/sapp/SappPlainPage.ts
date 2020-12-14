import { Sapp } from './Sapp';
import { DeferredUtil } from '../common/Deferred';
import { SappStartOptions } from './Sapp';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { EServChannel } from '../session/channel/ServChannel';
import { ServWindowChannelConfig } from '../session/channel/ServWindowChannel';
import { safeExec } from '../common';

export class SappPlainPage extends Sapp {
    start = DeferredUtil.reEntryGuard(this.mutex.lockGuard(async (options?: SappStartOptions): Promise<void> => {
        if (this.isStarted) {
            return;
        }

        if (this.closed.isFinished()) {
            throw new Error(`[SAPP] App has closed`);
        }

        try {
            const config = this.config;
            if (!config) {
                throw new Error('[SAPP] Config must be set before start');
            }

            options = options || {};

            await this.beforeStart(options);

            await this.beforeInitTerminal();
            await this.initTerminal(options);
            await this.afterInitTerminal();

            this.isStarted = true;

            if (this.controller) {
                this.controller.doCreate();
            }

            if (!this.config.hideOnStart) {
                const showParams: SappShowParams = {
                    force: true,
                };

                if (this.config.resolveStartShowData) {
                    showParams.data = await this.config.resolveStartShowData(this);
                }
                await this._show(showParams, true);
            }

            await this.afterStart();

            this.started.resolve();
        } catch (e) {
            this.started.reject(e);
            this.close();

            throw e;
        }
    }));

    async show(params?: SappShowParams) {
        return this._show(params);
    }

    async hide(params?: SappHideParams) {
        return this._hide(params);
    }

    protected _show = DeferredUtil.reEntryGuard(
        this.showHideMutex.lockGuard(
            async (params?: SappShowParams, byCreate?: boolean) => {
                safeExec(() => {
                    if (this.controller) {
                        this.controller.doShow();
                    }
                });
                
                this.showDone = DeferredUtil.create();
            }));

    protected _hide = DeferredUtil.reEntryGuard(
        this.showHideMutex.lockGuard(
            async (params?: SappHideParams, byClose?: boolean) => {
                if (this.showDone) {
                    this.showDone.resolve(params && params.data);
                }
                safeExec(() => {
                    if (this.controller) {
                        this.controller.doHide();
                    }
                });
            }));

    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async (result?: SappCloseResult) => {
                if (this.isStarted) {
                    await this._hide({ force: true }, true).catch(() => undefined);
                }

                safeExec(() => {
                    if (this.controller) {
                        this.controller.doClose(result);
                    }
                });
                
                if (result) {
                    if (result.error) {
                        this.closed.reject(result.error);
                    } else {
                        this.closed.resolve(result.data);
                    }
                } else {
                    this.closed.resolve();
                }

                if (this.terminal) {
                    this.terminal.servkit.destroyTerminal(this.terminal);
                    this.terminal = undefined!;
                }

                this.detachController();
                this.isStarted = false;
                this.started = DeferredUtil.reject(new Error('[SAPP] Closed'));
                this.started.catch(() => undefined);
                this.waitOnStart = undefined;
                this.manager = undefined!;
            }));

    protected async initTerminal(options: SappStartOptions): Promise<void> {
        const config = this.config;

        let terminalConfig: ServTerminalConfig = {
            id: this.uuid,
            type: EServTerminal.MASTER,
            session: {
                channel: {
                    type: EServChannel.WINDOW,
                },
            },
        };

        if (config.resolveSessionConfig) {
            terminalConfig.session = await config.resolveSessionConfig(this);
        } else {
            terminalConfig.session = {
                channel: {
                    type: EServChannel.WINDOW,
                },
            };
        }

        if (config.resolveTerminalConfig) {
            const newTerminalConfig = await config.resolveTerminalConfig(this, terminalConfig);
            if (newTerminalConfig) {
                terminalConfig = newTerminalConfig;
            }
        }

        terminalConfig.type = EServTerminal.MASTER;
        terminalConfig.session.checkSession = false;
        terminalConfig.session.checkOptions = undefined;
        const channelConfig = terminalConfig.session.channel.config as ServWindowChannelConfig;
        if (channelConfig && channelConfig.master) {
            channelConfig.master.dontWaitEcho = true;
        }
        
        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SAPP] Invalid terminal config');
        }

        // Setup terminal
        this.terminal = this.manager.getServkit().createTerminal(terminalConfig);

        await this.terminal.openSession();
    }

}
