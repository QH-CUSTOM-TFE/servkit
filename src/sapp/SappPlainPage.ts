import { Sapp, SappStartOptions, ESappType, SappTerminalExtData } from './Sapp';
import { DeferredUtil } from '../common/Deferred';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { EServChannel } from '../session/channel/ServChannel';
import { ServWindowChannelConfig } from '../session/channel/ServWindowChannel';
import { asyncThrow } from '../common/common';
import { ServEventLoaderChannelConfig } from '../session/channel/ServEventLoaderChannel';

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

            const asyncWorks = this.controller ? this.controller.doAsyncStart() : undefined;

            if (this.controller) {
                await this.controller.doStart();
            }

            await this.beforeInitTerminal();
            await this.initTerminal(options);
            await this.afterInitTerminal();

            if (asyncWorks) {
                await asyncWorks;
            }

            this.isStarted = true;

            if (this.controller) {
                await this.controller.doCreate();
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
                if (this.controller) {
                    try {
                        await this.controller.doShow();
                    } catch (e) {
                        asyncThrow(e);
                    }

                }

                this.showDone = DeferredUtil.create();

                return true;
            }));

    protected _hide = DeferredUtil.reEntryGuard(
        this.showHideMutex.lockGuard(
            async (params?: SappHideParams, byClose?: boolean) => {
                if (this.showDone) {
                    this.showDone.resolve(params && params.data);
                }
                if (this.controller) {
                    try {
                        await this.controller.doHide();
                    } catch (e) {
                        asyncThrow(e);
                    }
                }

                return true;
            }));

    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async (result?: SappCloseResult) => {
                // if (this.isStarted) {
                //     await this._hide({ force: true }, true).catch(() => undefined);
                // }

                if (this.controller) {
                    try {
                        await this.controller.doClose(result);
                    } catch (e) {
                        asyncThrow(e);
                    }
                }
                this.isClosed = true;

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

                return true;
            }));

    protected async initTerminal(options: SappStartOptions): Promise<void> {
        const config = this.config;
        const isIFrameApp = this.getAppType() === ESappType.IFRAME;

        let terminalConfig: ServTerminalConfig = {
            id: this.getTerminalId(),
            type: EServTerminal.MASTER,
            session: {
                channel: {
                    type: isIFrameApp ? EServChannel.WINDOW : EServChannel.EVENT_LOADER,
                },
            },
        };

        if (config.resolveSessionConfig) {
            terminalConfig.session = await config.resolveSessionConfig(this);
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
        terminalConfig.client = undefined;
        terminalConfig.server = undefined;

        let channelConfig =
            terminalConfig.session.channel.config as (ServWindowChannelConfig | ServEventLoaderChannelConfig);
        channelConfig = channelConfig ? { ... channelConfig} : {};
        channelConfig.master = channelConfig.master ? { ...channelConfig.master } : {} as any;
        channelConfig.master!.dontWaitEcho = true;

        terminalConfig.session.channel.config = channelConfig;

        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SAPP] Invalid terminal config');
        }

        // Setup terminal
        this.terminal = this.getServkit().createTerminal(terminalConfig);
        this.terminal.setExtData<SappTerminalExtData>({
            app: this,
            info: this.info,
        });

        await this.terminal.openSession();
    }
}
