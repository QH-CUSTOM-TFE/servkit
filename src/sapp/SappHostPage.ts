import { Sapp, SappStartOptions, SappTerminalExtData } from './Sapp';
import { DeferredUtil } from '../common/Deferred';
import { SappShowParams, SappHideParams } from './service/m/SappLifecycle';
import { ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { EServChannel } from '../session/channel/ServChannel';
import { asyncThrow, asyncThrowMessage, EServConstant, doWithTimeout } from '../common/common';
import { SappHostPageService, SappHostOnCloseResult } from './service/m/SappHostPageService';
import { SappHostInfo, SappHostPageService as HostPageService } from './service/s/SappHostPageService';
import { anno } from '../service/ServService';

export type SappHostOnCloseHandle = (app: SappHostPage) => Promise<SappHostOnCloseResult>;

export class SappHostPage extends Sapp {
    static isInHostEnv() {
        return window.parent !== window;
    }

    hostInfo: SappHostInfo = {
        id: '',
        token: '',
    };

    protected _onCloseHandle?: SappHostOnCloseHandle;
    protected _onCloseHandles?: { [key: string]: SappHostOnCloseHandle };

    /**
     * 启动应用
     *
     * @memberof SappHostPage
     */
    start = DeferredUtil.reEntryGuard(this.mutex.lockGuard(async (options?: SappStartOptions): Promise<void> => {
        if (this.isStarted) {
            return;
        }

        if (this.closed.isFinished()) {
            throw new Error('[SHOST] App has closed');
        }

        try {
            const config = this.config;
            if (!config) {
                throw new Error('[SHOST] Config must be set before start');
            }

            if (!SappHostPage.isInHostEnv()) {
                throw new Error('[SHOST] Not in host environment');
            }
    
            const timeout = -1; // config.startTimeout || EServConstant.SERV_SAPP_ON_START_TIMEOUT;

            await doWithTimeout(timeout, async () => {
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

                await this.checkAuth();

                this.isStarted = true;

                if (this.controller) {
                    await this.controller.doCreate();
                }

                await this.afterStart();

                this.started.resolve();
            }); 
        } catch (e) {
            this.started.reject(e);
            this.close();

            throw e;
        }
    }));

    async show(params?: SappShowParams) {
        return Promise.reject(new Error('[SHOST] show is not support for host page app'));
    }

    async hide(params?: SappHideParams) {
        return Promise.reject(new Error('[SHOST] hide is not support for host page app'));
    }

    /**
     * 关闭应用
     *
     * @memberof SappHostPage
     */
    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async () => {
                if (this.isStarted) {
                    const hostService = await this.service(HostPageService);
                    return await hostService.close();
                } else {
                    await this._close();
                    return true;
                }
            }));

    protected async onClose() {
        if (this._onCloseHandles) {
            const id = this.hostInfo.id;
            if (id && this._onCloseHandles[id]) {
                const result = await this._onCloseHandles[id](this);
                if (result.dontClose) {
                    return result;
                }
            }
        }

        if (this._onCloseHandle) {
            const result = await this._onCloseHandle(this);
            if (result.dontClose) {
                return result;
            }
        }

        await this._close();

        return {};
    }

    /**
     * 获取host页面提供的数据
     *
     * @param {*} [params]
     * @returns
     * @memberof SappHostPage
     */
    async getHostData(params?: any) {
        const hostService = await this.terminal.client.service(HostPageService);
        return hostService.getHostData(params);
    }

    private async _close() {
        if (this.controller) {
            try {
                await this.controller.doClose();
            } catch (e) {
                asyncThrow(e);
            }
        }
        this.isClosed = true;

        this.closed.resolve();

        if (this.terminal) {
            const terminal = this.terminal;
            this.terminal = undefined!;
            // give a chance to send back message
            setTimeout(() => {
                terminal.servkit.destroyTerminal(terminal);
            });
        }

        this.detachController();
        this.isStarted = false;
        this.started = DeferredUtil.reject(new Error('[SHOST] Closed'));
        this.started.catch(() => undefined);
        this.waitOnStart = undefined;
        this.manager = undefined!;
    }

    protected async initTerminal(options: SappStartOptions): Promise<void> {
        const config = this.config;
        
        let terminalConfig: ServTerminalConfig = {
            id: EServConstant.SHOST_TERMINAL_ID,
            type: EServTerminal.SLAVE,
            session: {
                channel: {
                    type: EServChannel.WINDOW,
                },
            },
        };

        if (config.resolveServiceClientConfig) {
            terminalConfig.client = await config.resolveServiceClientConfig(this);
        }

        if (config.resolveServiceServerConfig) {
            terminalConfig.server = await config.resolveServiceServerConfig(this);
        }

        if (config.resolveSessionConfig) {
            terminalConfig.session = await config.resolveSessionConfig(this);
        }

        if (config.resolveTerminalConfig) {
            const newTerminalConfig = await config.resolveTerminalConfig(this, terminalConfig);
            if (newTerminalConfig) {
                terminalConfig = newTerminalConfig;
            }
        }

        // Rewrite type
        terminalConfig.type = EServTerminal.SLAVE;

        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SHOST] Invalid terminal config');
        }

        // Setup acl resolver
        const aclResolver = config.resolveACLResolver ? config.resolveACLResolver(this) : undefined;
        if (aclResolver) {
            if (!terminalConfig.server) {
                terminalConfig.server = {};
            }
            terminalConfig.server.ACLResolver = aclResolver;
        }

        // Setup terminal
        this.terminal = this.getServkit().createTerminal(terminalConfig);
        this.terminal.setExtData<SappTerminalExtData>({
            app: this,
            info: this.info,
        });

        // Setup host service
        const self = this;
        const SappHostPageServiceImpl = class extends SappHostPageService {
            async onClose() {
                return self.onClose();
            }
        };
        anno.impl()(SappHostPageServiceImpl);
        this.terminal.server.addServices([{
            decl: SappHostPageService,
            impl: SappHostPageServiceImpl,
        }], {
            lazy: true,
        });

        const timeout = -1;
                        // config.startTimeout
                        // || EServConstant.SERV_SAPP_ON_START_TIMEOUT;

        await this.terminal.openSession({ timeout, waiting: aclResolver ? aclResolver.init() : undefined });
    }

    protected async checkAuth() {
        const hostService = await this.terminal.client.service(HostPageService);
        const hostInfo = await hostService.getHostInfo();

        try {
            await this.auth(hostInfo); 
        } catch (e) {
            asyncThrowMessage('[SHOST] Auth failed');
            throw e;
        }
            
        this.hostInfo = hostInfo;
    }

    /**
     * 设置onClose处理函数；
     * 可通过key设置匹配host页面的处理函数，key为host页面id，在hostInfo中提供；
     * 如果没有提供key，将设置全局的onClose处理函数。
     *
     * @param {SappHostOnCloseHandle} handle
     * @param {string} [key]
     * @memberof SappHostPage
     */
    setOnCloseHandle(handle: SappHostOnCloseHandle, key?: string) {
        if (!key) {
            this._onCloseHandle = handle;
        } else {
            if (!this._onCloseHandles) {
                this._onCloseHandles = {};
            }

            this._onCloseHandles[key] = handle;
        }
    }

    /**
     * 获取onClose处理函数；
     * 可通过key获取匹配host页面的处理函数，key为host页面id，在hostInfo中提供；
     * 如果没有提供key，将获取到全局的onClose处理函数。
     * 
     * @param {string} [key]
     * @returns
     * @memberof SappHostPage
     */
    getOnCloseHandle(key?: string) {
        return key ? this._onCloseHandles && this._onCloseHandles[key] : this._onCloseHandle;
    }
}
