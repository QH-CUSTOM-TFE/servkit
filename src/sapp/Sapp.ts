import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import {
    asyncThrow,
    EServConstant,
    safeExec,
} from '../common/index';
import { EServChannel } from '../session/channel/ServChannel';
import { ServService, anno, ServAPIArgs, ServAPIRetn, API_SUCCEED } from '../service/ServService';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappLifecycle, SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { SappLifecycle as Lifecycle } from './service/s/SappLifecycle';
import { SappInfo, SappMGR } from './SappMGR';
import { Deferred, DeferredUtil } from '../common/Deferred';
import { AsyncMutex } from '../common/AsyncMutex';
import { SappController } from './SappController';

/**
 * SappSDK启动参数
 */
// tslint:disable-next-line:no-empty-interface
export interface SappStartParams {

}

/**
 * SappSDK配置
 */
export interface SappConfig {
    hideOnStart?: boolean;

    /**
     * SappSDK.start() 前置回调
     * @param sdk 
     */
    beforeStart?(app: Sapp): Promise<void>;

    /**
     * SappSDK启动参数的构造回调；
     * 优先使用SappStartOptions.params，其次SappSDKConfig.resolveStartParams，默认使用parseQueryParams；
     * parseQueryParams将会从window.location.href中解析query参数
     * @param sdk 
     */
    resolveStartData?(app: Sapp): Promise<any> | any;

    /**
     * SappSDK启动参数的构造回调；
     * 优先使用SappStartOptions.params，其次SappSDKConfig.resolveStartParams，默认使用parseQueryParams；
     * parseQueryParams将会从window.location.href中解析query参数
     * @param sdk 
     */
    resolveStartShowData?(app: Sapp): Promise<any> | any;

    /**
     * ServiceServerConfig的构造回调
     * @param sdk 
     */
    resolveServiceServerConfig?(app: Sapp): Promise<ServServiceServerConfig> | ServServiceServerConfig;

    /**
     * ServiceClientConfig的构造回调
     * @param sdk 
     */
    resolveServiceClientConfig?(app: Sapp): Promise<ServServiceClientConfig> | ServServiceClientConfig;

    /**
     * SessionConfig的构造回调
     * @param sdk 
     */
    resolveSessionConfig?(sdk: Sapp): Promise<ServSessionConfig> | ServSessionConfig;

    /**
     * 在SappSDK中使用ServTerminal作为服务通信的桥接，ServTerminalConfig会通过该回调做最终的config调整
     * @param sdk 
     * @param config 
     */
    resolveTerminalConfig?(sdk: Sapp, config: ServTerminalConfig)
        : Promise<ServTerminalConfig> | ServTerminalConfig | void;

    /**
     * SappSDK.start() 后置回调
     * @param sdk 
     */
    afterStart?(sdk: Sapp): Promise<void>;
}

/**
 * SappSDK start参数项
 */
export interface SappStartOptions {
    data?: any | SappConfig['resolveStartData'];
}

/**
 * SappSDK是为Servkit应用提供的一个SDK
 */
export class Sapp {
    uuid: string;
    info: SappInfo;

    isStarted: boolean;
    started: Deferred;
    showDone?: Deferred<any>;
    closed: Deferred<any>;

    terminal: ServTerminal;

    protected controller?: SappController;
    protected config: SappConfig;
    protected waitOnStart?: Deferred;
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

            const waitOnStart = DeferredUtil.create({ timeout: EServConstant.SERV_SAPP_ON_START_TIMEOUT });
            this.waitOnStart = waitOnStart;

            options = options || {};

            await this.beforeStart(options);

            await this.beforeInitTerminal();
            await this.initTerminal(options);
            await this.afterInitTerminal();

            await waitOnStart.catch((error) => {
                if (this.waitOnStart) {
                    asyncThrow(new Error('[SAPP] App start timeout'));
                }
                throw error;
            });
            this.waitOnStart = undefined;

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
                const ret: { error?: Error, dontShow?: boolean } =
                    await this.service(Lifecycle).then((service) => {
                        return service.onShow({
                            ...params,
                            byCreate,
                        }).then((dontShow) => {
                            if (dontShow) {
                                asyncThrow(new Error(`[SAPP] Can\'t show app because rejection`));
                            }
                            return {
                                dontShow,
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
                    safeExec(() => {
                        if (this.controller) {
                            this.controller.doShow();
                        }
                    });
                    this.showDone = DeferredUtil.create();
                } else {
                    if (ret.error) {
                        throw ret.error;
                    }
                    if (ret.dontShow) {
                        throw new Error('reject');
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
                        }).then((dontHide) => {
                            if (dontHide) {
                                asyncThrow(new Error(`[SAPP] Can\'t hide app because rejection`));
                            }
                            return {
                                dontHide,
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
                    safeExec(() => {
                        if (this.controller) {
                            this.controller.doHide();
                        }
                    });
                } else {
                    if (ret.error) {
                        throw ret.error;
                    }

                    if (ret.dontHide) {
                        throw new Error('reject');
                    }

                    throw new Error('unknow');
                }
            }));

    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async (result?: SappCloseResult) => {
                if (this.isStarted) {
                    await this._hide({ force: true }, true).catch(() => undefined);
                    await this.service(Lifecycle).then((service) => {
                        return service.onClose();
                    }).catch((error) => {
                        asyncThrow(error);
                    });
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

    /**
     * 根据服务声明获取服务对象
     *
     * @template T
     * @param {T} decl
     * @returns {(InstanceType<T> | undefined)}
     * @memberof SappSDK
     */
    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    getService<M extends { [key: string]: typeof ServService }>(decls: M)
        : { [key in keyof M]: InstanceType<M[key]> | undefined };
    getService() {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]);
    }

    /**
     * 根据服务声明获取服务对象；非安全版本，在类型上任务返回的所有服务对象都是存在的，但实际可能并不存在（值为undefined）
     *
     * @template T
     * @param {T} decl
     * @returns {InstanceType<T>}
     * @memberof SappSDK
     */
    getServiceUnsafe<T extends typeof ServService>(decl: T): InstanceType<T>;
    getServiceUnsafe<M extends { [key: string]: typeof ServService }>(decls: M)
        : { [key in keyof M]: InstanceType<M[key]> };
    getServiceUnsafe() {
        return this.getService.apply(this, arguments);
    }

    /**
     * 根据服务声明获取服务对象，返回一个Promise；如果某个服务不存在，Promise将reject。
     *
     * @template T
     * @param {T} decl
     * @returns {Promise<InstanceType<T>>}
     * @memberof SappSDK
     */
    service<T extends typeof ServService>(decl: T): Promise<InstanceType<T>>;
    service<M extends { [key: string]: typeof ServService }>(decls: M)
        : Promise<{ [key in keyof M]: InstanceType<M[key]> }>;
    service() {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPP] Sapp is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    }

    /**
     * 根据服务声明获取服务对象，通过回调方式接收服务对象；如果某个服务不存在，回调得不到调用。
     *
     * @template T
     * @template R
     * @param {T} decl
     * @param {((service: InstanceType<T>) => R)} exec
     * @memberof SappSDK
     */
    serviceExec<
        T extends typeof ServService,
        R>(
            decl: T,
            exec: ((service: InstanceType<T>) => R));
    serviceExec<
        M extends { [key: string]: typeof ServService },
        R>(
            decls: M,
            exec: ((services: { [key in keyof M]: InstanceType<M[key]> }) => R));
    serviceExec() {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
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

    protected async beforeInitTerminal(): Promise<void> {
        //
    }

    protected async initTerminal(options: SappStartOptions): Promise<void> {
        const config = this.config;

        let terminalConfig: ServTerminalConfig = {
            id: this.uuid,
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

        // Rewrite type
        terminalConfig.type = EServTerminal.MASTER;

        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SAPP] Invalid terminal config');
        }

        // Setup terminal
        this.terminal = this.manager.getServkit().createTerminal(terminalConfig);

        // Setup lifecycle
        const self = this;
        const SappLifecycleImpl = class extends SappLifecycle {
            onStart(): ServAPIRetn {
                if (self.waitOnStart) {
                    self.waitOnStart.resolve();
                }
                return API_SUCCEED();
            }

            getStartData(): ServAPIRetn<any> {
                return self.resolveStartData(options);
            }

            show(p?: ServAPIArgs<SappShowParams>): ServAPIRetn {
                return self.show(p);
            }

            hide(p?: ServAPIArgs<SappHideParams>): ServAPIRetn {
                return self.hide(p);
            }

            close(result?: ServAPIArgs<SappCloseResult>): ServAPIRetn {
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

        await this.terminal.openSession();
    }

    protected async afterInitTerminal(): Promise<void> {
        //
    }
}
