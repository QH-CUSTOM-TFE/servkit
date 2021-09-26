import { ServTerminal, EServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { nextUUID, asyncThrow, Env } from '../common/common';
import { EServChannel } from '../session/channel/ServChannel';
import { SappLifecycle, SappShowParams, SappHideParams, SappCloseResult, SappAuthParams } from './service/m/SappLifecycle';
import { ServAPIRetn, API_SUCCEED, ServAPIArgs, anno } from '../service/ServService';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { AsyncMutex } from '../common/AsyncMutex';
import { DeferredUtil, Deferred } from '../common/Deferred';
import { SappLifecycle as Lifecycle } from './service/s/SappLifecycle';
import { SappSDK, SappAsyncLoadSDK } from './SappSDK';
import { ESappType } from './Sapp';
import { ServServiceConfig, ServServiceReferPattern } from '../service/ServServiceManager';
import { getAsyncLoadDeclContext, putAsyncLoadStartParams } from '../common/sharedParams';
import { SappLayoutOptions } from './SappMGR';

export interface SappSDKMockConfig {
    hideOnStart?: boolean;

    services?: ServServiceConfig['services'];

    serviceRefer?: ServServiceReferPattern;

    beforeStart?(): Promise<void>;

    resolveStartData?(): Promise<any> | any;

    resolveStartShowData?(): Promise<any> | any;

    resolveServiceServerConfig?(): Promise<ServServiceServerConfig> | ServServiceServerConfig;

    resolveServiceClientConfig?(): Promise<ServServiceClientConfig> | ServServiceClientConfig;

    resolveAsyncLoadLayout?(): Promise<SappLayoutOptions> | SappLayoutOptions;

    afterStart?(): Promise<void>;
}

export class SappSDKMock {
    static ENABLE_MARK = '__SAPPSDK_MOCK_ENABLE__';
    static isMockEnabled(): boolean {
        try {
            return Env.SAPPSDK_MOCK
                || (!!window.location.search && window.location.search.indexOf(SappSDKMock.ENABLE_MARK) >= 0);
        } catch (e) {
            return false;
        }
    }

    static tryAsynLoadBootstrap(appId: string) {
        try {
            if (!SappSDKMock.isMockEnabled()) {
                return;
            }

            setTimeout(() => {
                const context = getAsyncLoadDeclContext(appId);
                if (context) {
                    context.bootstrap();
                }
            }, Math.random() * 50);
        } catch (e) {
            //
        }
    }

    protected sdk: SappSDK;
    protected isStarted: boolean;
    protected config: SappSDKMockConfig;
    protected terminal: ServTerminal;
    protected mutex = new AsyncMutex();
    protected showHideMutex = new AsyncMutex();
    protected waitOnStart?: Deferred;

    constructor(sdk: SappSDK) {
        this.sdk = sdk;
        this.setConfig({});
    }

    setConfig(config: SappSDKMockConfig): this {
        this.config = config;

        return this;
    }

    getConfig() {
        return this.config;
    }

    async start() {
        if (!SappSDKMock.isMockEnabled()) {
            return;
        }

        if (!this.config) {
            throw new Error('[SAPPSDK] Mock config is invalid');
        }

        if (!this.sdk) {
            throw new Error('[SAPPSDK] Mock has closed');
        }

        await this.beforeStart();

        await this.initTerminal();

        await this.prepareForAsyncLoad();

        this.waitOnStart = DeferredUtil.create();
        this.waitOnStart.then(() => {
            this.waitOnStart = undefined;
            setTimeout(async () => {
                this.isStarted = true;

                if (!this.config.hideOnStart) {
                    const showParams: SappShowParams = {
                        force: true,
                    };

                    const data = await this.resolveStartShowData();
                    if (data !== undefined) {
                        showParams.data = data;
                    }

                    await this._show(showParams, true);
                }

                await this.afterStart();
            }, Math.random() * 50);
        }, () => {
            this.waitOnStart = undefined;
        });
    }

    protected async initTerminal() {
        const isAsyncLoadApp = this.sdk.getAppType() === ESappType.ASYNC_LOAD;
        const terminalConfig: ServTerminalConfig = {
            id: nextUUID(),
            type: EServTerminal.MASTER,
            session: {
                checkSession: true,
                checkOptions: {
                    onBroken: () => {
                        this.onSessionBroken();
                    },
                },
                channel: {
                    type: isAsyncLoadApp ? EServChannel.EVENT : EServChannel.MESSAGE,
                },
            },
        };

        const config = this.config;
        // Service server config
        {
            if (config.resolveServiceServerConfig) {
                terminalConfig.server = await config.resolveServiceServerConfig();
            }

            if (!terminalConfig.server) {
                terminalConfig.server = {};
            }

            let services = config.services;
            if (services && terminalConfig.server.service && terminalConfig.server.service.services) {
                services = services.concat(terminalConfig.server.service.services);
            }
            if (services) {
                const service = terminalConfig.server.service || {};
                service.services = services;
                terminalConfig.server.service = service;
            }

            if (config.serviceRefer) {
                terminalConfig.server.serviceRefer = config.serviceRefer;
            }

            if (!terminalConfig.server.serviceRefer) {
                terminalConfig.server.serviceRefer = /.*/;
            }
        }

        if (config.resolveServiceClientConfig) {
            terminalConfig.client = await config.resolveServiceClientConfig();
        }

        const terminal = this.sdk.getServkit().createTerminal(terminalConfig);

        const self = this;
        const SappLifecycleImpl = class extends SappLifecycle {
            onStart(): ServAPIRetn {
                if (self.waitOnStart) {
                    self.waitOnStart.resolve();
                }
                return API_SUCCEED();
            }

            auth(params: SappAuthParams): ServAPIRetn {
                return API_SUCCEED();
            }

            getStartData(): ServAPIRetn<any> {
                return self.resolveStartData();
            }

            show(p?: ServAPIArgs<SappShowParams>): ServAPIRetn<boolean> {
                return self.show(p);
            }

            hide(p?: ServAPIArgs<SappHideParams>): ServAPIRetn<boolean> {
                return self.hide(p);
            }

            close(result?: ServAPIArgs<SappCloseResult>): ServAPIRetn<boolean> {
                return self.close(result);
            }
        };
        anno.impl()(SappLifecycleImpl);

        terminal.server.addServices([{
            decl: SappLifecycle,
            impl: SappLifecycleImpl,
        }], {
            lazy: true,
        });

        await terminal.openSession();

        this.terminal = terminal;
    }

    fixSlaveTerminalConfig(config: ServTerminalConfig) {
        const isAsyncLoadApp = this.sdk.getAppType() === ESappType.ASYNC_LOAD;

        config.id = this.terminal.id;
        config.session.checkSession = true;
        config.session.channel = {
            type: isAsyncLoadApp ? EServChannel.EVENT : EServChannel.MESSAGE,
        };
    }

    protected async resolveStartData(): Promise<any> {
        const resolveData = this.config.resolveStartData!;
        if (resolveData) {
            return resolveData();
        }
    }

    protected async resolveStartShowData(): Promise<any> {
        const resolveData = this.config.resolveStartShowData;
        if (resolveData) {
            return resolveData();
        }
    }

    async show(params?: SappShowParams) {
        return this._show(params);
    }

    async hide(params?: SappHideParams) {
        return this._hide(params);
    }

    protected _show = DeferredUtil.reEntryGuard(
        this.showHideMutex.lockGuard(
            async (params?: SappShowParams, byCreate?: boolean) => {
                const ret: { error?: Error, dontShow?: boolean } =
                    await this.terminal.client.service(Lifecycle).then((service) => {
                        return service.onShow({
                            ...params,
                            byCreate,
                        }).then((dontShow) => {
                            if (dontShow) {
                                asyncThrow(new Error(`[SAPPSDK] Can\'t show app because rejection`));
                            }
                            return {
                                dontShow: !!dontShow,
                            };
                        }, (error) => {
                            asyncThrow(error);
                            asyncThrow(new Error(`[SAPPSDK] Can\'t show app because error`));
                            return {
                                error,
                            };
                        });
                    }, (error) => {
                        asyncThrow(error);
                        asyncThrow(new Error(`[SAPPSDK] Can\'t show app because lifecycle service not provided`));
                        return {
                            error,
                        };
                    });

                return true;
            }));

    protected _hide = DeferredUtil.reEntryGuard(
        this.showHideMutex.lockGuard(
            async (params?: SappHideParams, byClose?: boolean) => {
                const ret: { error?: Error, dontHide?: boolean } =
                    await this.terminal.client.service(Lifecycle).then((service) => {
                        return service.onHide({
                            byClose,
                            ...params,
                        }).then((dontHide) => {
                            if (dontHide) {
                                asyncThrow(new Error(`[SAPPSDK] Can\'t hide app because rejection`));
                            }
                            return {
                                dontHide: !!dontHide,
                            };
                        }, (error) => {
                            asyncThrow(error);
                            asyncThrow(new Error(`[SAPPSDK] Can\'t hide app because error`));
                            return {
                                error,
                            };
                        });
                    }, (error) => {
                        asyncThrow(error);
                        asyncThrow(new Error(`[SAPPSDK] Can\'t hide app because lifecycle service not provided`));
                        return {
                            error,
                        };
                    });
                
                return true;
            }));

    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async (result?: SappCloseResult) => {
                if (this.isStarted) {
                    // await this._hide({ force: true }, true).catch(() => undefined);
                    const onCloseResult = await this.terminal.client.service(Lifecycle).then((service) => {
                        return service.onClose();
                    }).catch((error) => {
                        asyncThrow(error);
                    });

                    if (onCloseResult && onCloseResult.dontClose) {
                        return false;
                    }
                }

                if (this.terminal) {
                    const terminal = this.terminal;
                    this.terminal = undefined!;
                    // The close operation maybe from sapp, need to send back message;
                    // so lazy the destroy to next tick 
                    setTimeout(() => {
                        terminal.servkit.destroyTerminal(terminal);
                    });
                }

                this.sdk = undefined!;
                this.isStarted = false;
                this.waitOnStart = undefined;

                return true;
            }));

    getService: ServServiceClient['getService'] = function(this: SappSDK) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]) as any;
    };

    getServiceUnsafe: ServServiceClient['getServiceUnsafe'] = function(this: SappSDK) {
        return this.getService.apply(this, arguments);
    };

    service: ServServiceClient['service'] = function(this: SappSDKMock) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    };

    serviceExec: ServServiceClient['serviceExec'] = function(this: SappSDKMock) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    };

    getServerService: ServServiceServer['getService'] = function(this: SappSDKMock) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.server.getService(arguments[0]);
    };

    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'] = function(this: SappSDKMock) {
        return this.getServerService.apply(this, arguments);
    };

    serverService: ServServiceServer['service'] = function(this: SappSDKMock) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
        }

        return this.terminal.server.service.apply(this.terminal.server, arguments);
    };

    serverServiceExec: ServServiceServer['serviceExec'] = function(this: SappSDKMock) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
    };

    protected async beforeStart(): Promise<void> {
        if (this.config.beforeStart) {
            await this.config.beforeStart();
        }
    }

    protected async afterStart(): Promise<void> {
        if (this.config.afterStart) {
            await this.config.afterStart();
        }
    }

    protected onSessionBroken() {
        if (this.sdk) {
            asyncThrow(new Error('Session broken'));
            this.close();
        }
    }

    protected async prepareForAsyncLoad() {
        const sdk = this.sdk;
        if (!(sdk instanceof SappAsyncLoadSDK)) {
            return;
        }
        const config = this.config;

        let layout: SappLayoutOptions | undefined;
        if (config.resolveAsyncLoadLayout) {
            layout = await config.resolveAsyncLoadLayout();
        }

        if (!layout || !layout.container) {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.width = '100%';
            el.style.height = '100%';

            document.body.appendChild(el);
            
            layout = {
                container: el,
            };
        }

        putAsyncLoadStartParams(sdk.getAppId(), {
            uuid: this.terminal.id,
            container: layout.container as HTMLElement,
        });
    }
}
