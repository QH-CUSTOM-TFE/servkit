import { Servkit } from '../servkit';
import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import {
    asyncThrow,
    EServConstant,
} from '../common/common';
import { anno, ServAPIArgs, ServAPIRetn, API_SUCCEED, API_ERROR } from '../service/ServService';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappLifecycle, SappShowParams, SappHideParams, SappCloseResult, SappAuthParams } from './service/m/SappLifecycle';
import { SappLifecycle as Lifecycle } from './service/s/SappLifecycle';
import { SappMGR } from './SappMGR';
import { Deferred, DeferredUtil } from '../common/Deferred';
import { AsyncMutex } from '../common/AsyncMutex';
import { SappController } from './SappController';
import { replacePlaceholders } from '../common/query';
import { SappACLResolver } from './SappACLResolver';

export enum ESappCreatePolicy {
    NONE = 0,
    SINGLETON,  // Default
    INFINITE,
}

export enum ESappLifePolicy {
    NONE = 0,
    MANUAL, // Default
    AUTO,
}

export enum ESappType {
    IFRAME = 'IFRAME',  // Default
    ASYNC_LOAD = 'ASYNC_LOAD',
}

export class SappInfo {
    id: string;
    version: string;
    name?: string;
    desc?: string;
    type?: ESappType;
    url: string;
    html?: string;
    options: {
        create?: ESappCreatePolicy;
        life?: ESappLifePolicy;
        lifeMaxHideTime?: number;
        dontStartOnCreate?: boolean;
        layout?: string;
        isPlainPage?: boolean;
        startTimeout?: number;
        useTerminalId?: string;
    };
}

export interface SappConfig {
    hideOnStart?: boolean;

    beforeStart?(app: Sapp): Promise<void>;

    resolveStartData?(app: Sapp): Promise<any> | any;

    resolveStartShowData?(app: Sapp): Promise<any> | any;

    resolveServiceServerConfig?(app: Sapp): Promise<ServServiceServerConfig> | ServServiceServerConfig;

    resolveServiceClientConfig?(app: Sapp): Promise<ServServiceClientConfig> | ServServiceClientConfig;

    resolveSessionConfig?(app: Sapp): Promise<ServSessionConfig> | ServSessionConfig;

    resolveTerminalConfig?(app: Sapp, config: ServTerminalConfig)
        : Promise<ServTerminalConfig> | ServTerminalConfig | void;

    resolveACLResolver?(app: Sapp): SappACLResolver;

    afterStart?(app: Sapp): Promise<void>;

    startTimeout?: number;

    useTerminalId?: string;
}

export interface SappStartOptions {
    data?: any | SappConfig['resolveStartData'];
    showData?: any | SappConfig['resolveStartShowData'];
}

export class Sapp {
    static transformContentByInfo(content: string, info: SappInfo) {
        return replacePlaceholders(content, { version: info.version });
    }

    uuid: string;
    info: SappInfo;

    isStarted: boolean;
    started: Deferred;
    showDone?: Deferred<any>;
    isClosed: boolean;
    closed: Deferred<any>;

    terminal: ServTerminal;

    protected controller?: SappController;
    protected config: SappConfig;
    protected waitOnStart?: Deferred;
    protected waitOnAuth?: Deferred;
    protected mutex = new AsyncMutex();
    protected showHideMutex = new AsyncMutex();
    protected manager: SappMGR;

    constructor(uuid: string, info: SappInfo, manager: SappMGR) {
        this.uuid = uuid;
        this.info = info;
        this.manager = manager;

        this.started = DeferredUtil.create();
        this.closed = DeferredUtil.create();
        this.mutex = new AsyncMutex();
        this.showHideMutex = new AsyncMutex();

        this.setConfig({});
    }

    attachController(controller: SappController) {
        if (this.controller === controller) {
            return false;
        }

        if (this.controller && this.controller !== controller) {
            this.detachController();
        }

        this.controller = controller;
        if (controller) {
            controller.onAttach(this);
        }

        return true;
    }

    detachController() {
        if (this.controller) {
            this.controller.onDetach(this);
            this.controller = undefined;
        }
    }

    getController() {
        return this.controller;
    }

    setConfig(config: SappConfig) {
        this.config = config;
        return this;
    }

    getConfig() {
        return this.config;
    }

    getServkit(): Servkit {
        return this.manager ? this.manager.getServkit() : undefined!;
    }

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

            const newOptions = options || {};

            const timeout = config.startTimeout
                            || this.info.options.startTimeout
                            || EServConstant.SERV_SAPP_ON_START_TIMEOUT;

            let timer = 0;
            const pTimeout = timeout > 0 ? new Promise<void>((resolve, reject) => {
                timer = setTimeout(() => {
                    timer = 0;
                    reject(new Error('timeout'));
                }, timeout) as any;
            }) : undefined;

            const startWork = async () => {
                const waitOnAuth = DeferredUtil.create({
                    rejectIf: pTimeout,
                });
                this.waitOnAuth = waitOnAuth;

                const waitOnStart = DeferredUtil.create({
                    rejectIf: waitOnAuth,
                });
                this.waitOnStart = waitOnStart;

                await this.beforeStart(newOptions);

                const asyncWorks = this.controller ? this.controller.doAsyncStart() : undefined;

                if (this.controller) {
                    await this.controller.doStart();
                }

                await this.beforeInitTerminal();
                await this.initTerminal(newOptions);
                await this.afterInitTerminal();

                await waitOnAuth.catch((error) => {
                    if (this.waitOnAuth) {
                        asyncThrow(new Error('[SAPP] App auth failed'));
                    }
                    throw error;
                });
                this.waitOnAuth = undefined;

                await waitOnStart.catch((error) => {
                    if (this.waitOnStart) {
                        asyncThrow(new Error('[SAPP] App start timeout'));
                    }
                    throw error;
                });
                this.waitOnStart = undefined;

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

                    const data = await this.resolveStartShowData(newOptions);
                    if (data !== undefined) {
                        showParams.data = data;
                    }

                    await this._show(showParams, true);
                }

                await this.afterStart();

                this.started.resolve();
            };

            const pWork = startWork();
            let pDone = pWork;
            if (pTimeout) {
                pDone = Promise.race([pWork, pTimeout]).then(() => {
                    if (timer) {
                        clearTimeout(timer);
                        timer = 0;
                    }
                }, (error) => {
                    if (timer) {
                        clearTimeout(timer);
                        timer = 0;
                    }
                    throw error;
                });
            }

            await pDone;
        } catch (e) {
            this.started.reject(e);
            this.close();

            throw e;
        }
    }));

    getAppType(): ESappType {
        return this.info.type || ESappType.IFRAME;
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
                    await this.service(Lifecycle).then((service) => {
                        return service.onShow({
                            ...params,
                            byCreate,
                        }).then((result) => {
                            if (result && result.dontShow) {
                                asyncThrow(new Error(`[SAPP] Can\'t show app because rejection`));
                            }
                            return {
                                dontShow: !!(result && result.dontShow),
                            };
                        }, (error) => {
                            asyncThrow(error);
                            asyncThrow(new Error(`[SAPP] Can\'t show app because error`));
                            return {
                                error,
                            };
                        });
                    }, (error) => {
                        asyncThrow(error);
                        asyncThrow(new Error(`[SAPP] Can\'t show app because lifecycle service not provided`));
                        return {
                            error,
                        };
                    });

                if (!ret.error && ((params && params.force) || !ret.dontShow)) {
                    if (this.controller) {
                        try {
                            await this.controller.doShow();
                        } catch (e) {
                            asyncThrow(e);
                        }
                    }
                    this.showDone = DeferredUtil.create();

                    return true;
                } else {
                    if (ret.error) {
                        throw ret.error;
                    }
                    if (ret.dontShow) {
                        return false;
                    }

                    throw new Error('unknow');
                }
            }));

    protected _hide = DeferredUtil.reEntryGuard(
        this.showHideMutex.lockGuard(
            async (params?: SappHideParams, byClose?: boolean) => {
                const ret: { error?: Error, dontHide?: boolean } =
                    await this.service(Lifecycle).then((service) => {
                        return service.onHide({
                            byClose,
                            ...params,
                        }).then((result) => {
                            if (result && result.dontHide) {
                                asyncThrow(new Error(`[SAPP] Can\'t hide app because rejection`));
                            }
                            return {
                                dontHide: !!(result && result.dontHide),
                            };
                        }, (error) => {
                            asyncThrow(error);
                            asyncThrow(new Error(`[SAPP] Can\'t hide app because error`));
                            return {
                                error,
                            };
                        });
                    }, (error) => {
                        asyncThrow(error);
                        asyncThrow(new Error(`[SAPP] Can\'t hide app because lifecycle service not provided`));
                        return {
                            error,
                        };
                    });

                if (!ret.error && ((params && params.force) || !ret.dontHide)) {
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
                } else {
                    if (ret.error) {
                        throw ret.error;
                    }

                    if (ret.dontHide) {
                        return false;
                    }

                    throw new Error('unknow');
                }
            }));

    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async (result?: SappCloseResult) => {
                if (this.isStarted) {
                    // await this._hide({ force: true }, true).catch(() => undefined);
                    const onCloseResult = await this.service(Lifecycle).then((service) => {
                        return service.onClose();
                    }).catch((error) => {
                        asyncThrow(error);
                    });

                    if (onCloseResult && onCloseResult.dontClose) {
                        return false;
                    }
                }

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
                    const terminal = this.terminal;
                    this.terminal = undefined!;
                    // The close operation maybe from sapp, need to send back message;
                    // so lazy the destroy to next tick
                    setTimeout(() => {
                        terminal.servkit.destroyTerminal(terminal);
                    });
                }

                this.detachController();
                this.isStarted = false;
                this.started = DeferredUtil.reject(new Error('[SAPP] Closed'));
                this.started.catch(() => undefined);

                this.waitOnStart = undefined;
                this.waitOnAuth = undefined;
                this.manager = undefined!;

                return true;
            }));

    getService: ServServiceClient['getService'] = function(this: Sapp) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]);
    };

    getServiceUnsafe: ServServiceClient['getServiceUnsafe'] = function(this: Sapp) {
        return this.getService.apply(this, arguments);
    };

    service: ServServiceClient['service'] = function(this: Sapp) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPP] Sapp is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    };

    serviceExec: ServServiceClient['serviceExec'] = function(this: Sapp) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    };

    getServerService: ServServiceServer['getService'] = function(this: Sapp) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.server.getService(arguments[0]);
    };

    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'] = function(this: Sapp) {
        return this.getServerService.apply(this, arguments);
    };

    serverService: ServServiceServer['service'] = function(this: Sapp) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPP] Sapp is not started'));
        }

        return this.terminal.server.service.apply(this.terminal.server, arguments);
    };

    serverServiceExec: ServServiceServer['serviceExec'] = function(this: Sapp) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
    };

    protected async auth(params: SappAuthParams): Promise<void> {
        if (this.isClosed) {
            return Promise.reject('closed');
        }

        if (!this.controller) {
            return;
        }

        return this.controller.doAuth(params);
    }

    protected async beforeStart(options: SappStartOptions): Promise<void> {
        if (this.config.beforeStart) {
            await this.config.beforeStart(this);
        }
    }

    protected async afterStart(): Promise<void> {
        if (this.config.afterStart) {
            await this.config.afterStart(this);
        }
    }

    protected onStartFailed() {
        if (this.terminal) {
            this.terminal.servkit.destroyTerminal(this.terminal);
        }
        this.terminal = undefined!;
    }

    protected async resolveStartData(options: SappStartOptions): Promise<any> {
        let resolveData: SappConfig['resolveStartData'] = undefined!;
        if (options.data) {
            resolveData =
                typeof options.data === 'function'
                    ? options.data as SappConfig['resolveStartData']
                    : (() => options.data!);
        } else {
            resolveData = this.config.resolveStartData;
        }

        if (resolveData) {
            return resolveData(this);
        }
    }

    protected async resolveStartShowData(options: SappStartOptions): Promise<any> {
        let resolveData: SappConfig['resolveStartShowData'] = undefined!;
        if (options.showData) {
            resolveData =
                typeof options.showData === 'function'
                    ? options.showData as SappConfig['resolveStartShowData']
                    : (() => options.showData!);
        } else {
            resolveData = this.config.resolveStartShowData;
        }

        if (resolveData) {
            return resolveData(this);
        }
    }

    protected async beforeInitTerminal(): Promise<void> {
        //
    }

    protected async initTerminal(options: SappStartOptions): Promise<void> {
        const config = this.config;

        let terminalConfig: ServTerminalConfig = {
            id: this.getTerminalId(),
            type: EServTerminal.MASTER,
            session: undefined!,
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
        terminalConfig.type = EServTerminal.MASTER;

        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SAPP] Invalid terminal config');
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

        // Setup lifecycle
        const self = this;
        const SappLifecycleImpl = class extends SappLifecycle {
            onStart(): ServAPIRetn {
                if (self.isClosed) {
                    return API_ERROR('closed');
                }
                if (self.waitOnStart) {
                    self.waitOnStart.resolve();
                }

                if (self.isStarted) {   // For has started app, do show work
                    Promise.resolve().then(async () => {
                        if (!self.isStarted) {
                            return;
                        }

                        const showParams: SappShowParams = {
                            force: true,
                        };

                        const data = await self.resolveStartShowData(options);
                        if (data !== undefined) {
                            showParams.data = data;
                        }

                        self._show(showParams, true);
                    });
                }
                return API_SUCCEED();
            }

            auth(params: SappAuthParams): ServAPIRetn {
                if (self.isClosed) {
                    return API_ERROR('closed');
                }

                const p = self.auth(params);
                p.then(() => {
                    if (self.waitOnAuth) {
                        self.waitOnAuth.resolve();
                    }
                }, (e) => {
                    if (self.waitOnAuth) {
                        self.waitOnAuth.reject(e);
                    }
                });

                return p;
            }

            getStartData(): ServAPIRetn<any> {
                if (self.isClosed) {
                    return API_ERROR('closed');
                }
                return self.resolveStartData(options);
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

        this.terminal.server.addServices([{
            decl: SappLifecycle,
            impl: SappLifecycleImpl,
        }], {
            lazy: true,
        });

        const timeout = config.startTimeout
                        || this.info.options.startTimeout
                        || EServConstant.SERV_SAPP_ON_START_TIMEOUT;

        await this.terminal.openSession({ timeout, waiting: aclResolver ? aclResolver.init() : undefined });
    }

    protected async afterInitTerminal(): Promise<void> {
        //
    }

    getTerminalId() {
        if (this.terminal) {
            return this.terminal.id;
        }

        return this.config.useTerminalId
            || this.info.options.useTerminalId
            || this.uuid;
    }
}
