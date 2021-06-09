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

/**
 * Sapp创建策略，当应用重复创建时，使用该枚举值进行控制
 */
export enum ESappCreatePolicy {
    NONE = 0,
    /**
     * 单例模式，重复创建应用会失败；默认值
     */
    SINGLETON,

    /**
     * 无限模式，可以创建任意多应用实例
     */
    INFINITE,
}

/**
 * Sapp在隐藏时的生命管理策略；对于一些加载敏感的应用，可以使用显示/隐藏来提高应用的加载体验；而如果应用占优资源较多，隐藏时间过长时，则可以基于该枚举来控制是否直接关闭应用而释放资源
 */
export enum ESappLifePolicy {
    NONE = 0,
    /**
     * 手动模式，在隐藏后，需要显式关闭应用；默认值
     */
    MANUAL,
    /**
     * 自动模式，在隐藏超过lifeMaxHideTime时间后，应用自动被关闭
     */
    AUTO,
}

/**
 * Sapp类型
 */
export enum ESappType {
    /**
     * 基于IFrame的应用，应用运行在一个IFrame Web上下文，与主应用运行环境完全隔离；默认值
     */
    IFRAME = 'IFRAME',
    /**
     * 基于异步机制的应用，应用与主应用运行在同一个Web环境；
     */
    ASYNC_LOAD = 'ASYNC_LOAD',
}

/**
 * Sapp信息
 */
export class SappInfo {
    /**
     * 应用唯一ID，建议使用类Java的域ID命名方式，比如“com.servkit.example”
     *
     * @type {string}
     * @memberof SappInfo
     */
    id: string;
    /**
     * 应用版本
     *
     * @type {string}
     * @memberof SappInfo
     */
    version: string;
    /**
     * 应用名称
     *
     * @type {string}
     * @memberof SappInfo
     */
    name?: string;
    /**
     * 应用描述
     *
     * @type {string}
     * @memberof SappInfo
     */
    desc?: string;
    /**
     * 引用类型，默认为SappType.IFRAME
     *
     * @type {ESappType}
     * @memberof SappInfo
     */
    type?: ESappType;
    /**
     * 对于SappType.IFRAME应用，url为页面链接；
     * 对于SappType.ASYNC_LOAD应用，url为应用的script entry链接；
     *
     * @type {string}
     * @memberof SappInfo
     */
    url: string;
    /**
     * 对于SappType.ASYNC_LOAD应用，有时候一个简单的script entry链接可能是不够的，这个时候需要以的html来整合应用的entry信息；
     *
     * 注意：
     * 1：与SappInfo.url不能同时存在
     * 2：只对SappType.ASYNC_LOAD应用生效
     *
     * @type {string}
     * @memberof SappInfo
     *
     * @example
     * ``` ts
     * html:
     *   `
     *    <html>
     *        <script type="text/javascript" src="assets/a.js?\${version}" crossorigin></script>
     *        <script type="text/javascript" src="assets/b.js?\${version}" crossorigin></script>
     *    </html>
     *    `
     * ```
     */
    html?: string;
    /**
     * 其他option项
     *
     * @memberof SappInfo
     */
    options: {
        /**
         * 应用创建策略
         *
         * @type {ESappCreatePolicy}
         */
        create?: ESappCreatePolicy;
        /**
         * 应用隐藏生命管理策略
         *
         * @type {ESappLifePolicy}
         */
        life?: ESappLifePolicy;
        /**
         * 对于SappLifePolicy.AUTO模式下，应用可hide的最大时间，单位为毫秒
         *
         * @type {number}
         */
        lifeMaxHideTime?: number;
        /**
         * 在SappMGR.create应用时，先不要start应用；默认会自动start；
         * 刚字段可用于手动管理应用 创建和启动 两个生命周期阶段；
         *
         * @type {boolean}
         */
        dontStartOnCreate?: boolean;
        /**
         * 应用的布局配置
         *
         * @type {string}
         */
        layout?: string;
        /**
         * 应用是否是普通网页；如果应用是一个普通网页，则简单的以IFrame元素加载页面即可；应用和主应用之间没有权限校验，也没有API交互，纯粹展示页面；
         *
         * @type {boolean}
         */
        isPlainPage?: boolean;
        /**
         * 应用start时的timeout配置，默认为30s；当指定值<0时，则start永远不会超时；
         * start不需要超时的场景：
         * 1：比如应用里面需要登录，但是登录会是另一个页面；
         * 2：应用是一个多页面结构；
         *
         * @type {number}
         */
        startTimeout?: number;
        /**
         * 显式指定应用与主应用之间的通信ID；默认主应用会随机生成一个ID，并通过URL参数传递给从应用，但是当从应用内存在多页面跳转，则通过URL参数传递会失效，因此可以通过该字段显式指定通信ID
         *
         * @type {string}
         */
        useTerminalId?: string;
    };
}

/**
 * Sapp配置项，必须在sapp.start之前设置好
 *
 * @export
 * @interface SappConfig
 */
export interface SappConfig {
    /**
     * 在start时，先隐藏应用；默认情况下，start会自动显式
     *
     * @type {boolean}
     * @memberof SappConfig
     */
    hideOnStart?: boolean;

    /**
     * start前置回调
     *
     * @param {Sapp} app
     * @returns {Promise<void>}
     * @memberof SappConfig
     */
    beforeStart?(app: Sapp): Promise<void>;

    /**
     * start生命周期阶段，data构造回调，SappSDK在onCreate回调中会拿到该数据
     *
     * @param {Sapp} app
     * @returns {(Promise<any> | any)}
     * @memberof SappConfig
     */
    resolveStartData?(app: Sapp): Promise<any> | any;

    /**
     * 用于在start中自动调用show时，传递的data；SappSDK在onShow回调中会拿到该数据
     *
     * @param {Sapp} app
     * @returns {(Promise<any> | any)}
     * @memberof SappConfig
     */
    resolveStartShowData?(app: Sapp): Promise<any> | any;

    /**
     * servkit底层配置构造API；构造Sapp向SappSDK中暴露的服务
     *
     * @param {Sapp} app
     * @returns {(Promise<ServServiceServerConfig> | ServServiceServerConfig)}
     * @memberof SappConfig
     */
    resolveServiceServerConfig?(app: Sapp): Promise<ServServiceServerConfig> | ServServiceServerConfig;

    /**
     * servkit底层配置构造API；暂无
     *
     * @param {Sapp} app
     * @returns {(Promise<ServServiceClientConfig> | ServServiceClientConfig)}
     * @memberof SappConfig
     */
    resolveServiceClientConfig?(app: Sapp): Promise<ServServiceClientConfig> | ServServiceClientConfig;

    /**
     * servkit底层配置构造API；构造会话配置
     *
     * @param {Sapp} app
     * @returns {(Promise<ServSessionConfig> | ServSessionConfig)}
     * @memberof SappConfig
     */
    resolveSessionConfig?(app: Sapp): Promise<ServSessionConfig> | ServSessionConfig;

    /**
     * servkit底层配置构造API；ServTerminal相关构造回调
     *
     * @param {Sapp} app
     * @param {ServTerminalConfig} config
     * @returns {(Promise<ServTerminalConfig> | ServTerminalConfig | void)}
     * @memberof SappConfig
     */
    resolveTerminalConfig?(app: Sapp, config: ServTerminalConfig)
        : Promise<ServTerminalConfig> | ServTerminalConfig | void;

    /**
     * servkit底层配置构造API；Service ACL权限管理
     *
     * @param {Sapp} app
     * @returns {SappACLResolver}
     * @memberof SappConfig
     */
    resolveACLResolver?(app: Sapp): SappACLResolver;

    /**
     * start后置回调
     *
     * @param {Sapp} app
     * @returns {Promise<void>}
     * @memberof SappConfig
     */
    afterStart?(app: Sapp): Promise<void>;

    /**
     * 参见SappInfo.options.startTimeout
     *
     * @type {number}
     * @memberof SappConfig
     */
    startTimeout?: number;

    /**
     * 参见SappInfo.options.useTerminalId
     *
     * @type {string}
     * @memberof SappConfig
     */
    useTerminalId?: string;
}

/**
 * Sapp.start参数
 *
 * @export
 * @interface SappStartOptions
 */
export interface SappStartOptions {
    /**
     * 参加SappConfig.resolveStartData
     *
     * @type {(any | SappConfig['resolveStartData'])}
     * @memberof SappStartOptions
     */
    data?: any | SappConfig['resolveStartData'];
    /**
     * 参加SappConfig.resolveStartShowData
     *
     * @type {(any | SappConfig['resolveStartShowData'])}
     * @memberof SappStartOptions
     */
    showData?: any | SappConfig['resolveStartShowData'];
}

/**
 * 在主应用中，从应用抽象类；可通过Sapp实例操作从应用，并与从应用进行同行；
 *
 * Sapp主要提供：
 * 1：应用信息、生命周期状态
 * 2：生命周期操作API：start、show、hide、close
 * 3：服务通信
 *
 * 可通过SappController对Sapp做更多定制化控制
 *
 * @export
 * @class Sapp
 */
export class Sapp {
    static transformContentByInfo(content: string, info: SappInfo) {
        return replacePlaceholders(content, { version: info.version });
    }

    /**
     * 唯一ID
     *
     * @type {string}
     * @memberof Sapp
     */
    uuid: string;

    /**
     * 应用信息
     *
     * @type {SappInfo}
     * @memberof Sapp
     */
    info: SappInfo;

    /**
     * 应用是否已经成功start；
     * 注意：
     * 在start过程中isStarted仍然为false
     *
     * @type {boolean}
     * @memberof Sapp
     */
    isStarted: boolean;
    /**
     * 应用start deferred promise；
     *
     * @type {Deferred}
     * @memberof Sapp
     *
     * @example
     * ``` ts
     * app.started
     * .then(() => { ... })
     * .catch(() => { ... })
     * ```
     */
    started: Deferred;
    showDone?: Deferred<any>;
    /**
     * 应用是否已经关闭
     *
     * @type {boolean}
     * @memberof Sapp
     */
    isClosed: boolean;
    /**
     * 应用close deferred promise；只用应用创建后，就可通过该字段等待应用close事件；
     *
     * @type {Deferred<any>}
     * @memberof Sapp
     *
     * @example
     * ``` ts
     * // 应用启动
     * app.start();
     * // 等待应用close事件
     * app.closed.then(() => { ... });
     * ```
     */
    closed: Deferred<any>;

    /**
     * servkit底层通信terminal
     *
     * @type {ServTerminal}
     * @memberof Sapp
     */
    terminal: ServTerminal;

    /**
     * 应用关联Controller
     *
     * @protected
     * @type {SappController}
     * @memberof Sapp
     */
    protected controller?: SappController;
    protected config: SappConfig;
    protected waitOnStart?: Deferred;
    protected waitOnAuth?: Deferred;
    protected mutex = new AsyncMutex();
    protected showHideMutex = new AsyncMutex();
    /**
     * 应用关联Manager
     *
     * @protected
     * @type {SappMGR}
     * @memberof Sapp
     */
    protected manager: SappMGR;

    /**
     * 构造函数
     * @param {string} uuid 应用唯一ID
     * @param {SappInfo} info 应用信息
     * @param {SappMGR} manager 应用所属管理器
     * @memberof Sapp
     */
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

    /**
     * 获取应用关联的Controller
     *
     * @returns
     * @memberof Sapp
     */
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

    getServkit() {
        return this.manager ? this.manager.getServkit() : undefined!;
    }

    /**
     * 启动应用；具有防重入处理，重复的调用会得到第一次调用返回的Promise对象
     *
     * @param {SappStartOptions} options
     * @memberof Sapp
     */
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

    /**
     * 获取应用类型
     *
     * @returns {ESappType}
     * @memberof Sapp
     */
    getAppType(): ESappType {
        return this.info.type || ESappType.IFRAME;
    }

    /**
     * 显示应用，params.data会传递给SappSDK onShow回调
     *
     * @param {SappShowParams} [params]
     * @returns
     * @memberof Sapp
     */
    async show(params?: SappShowParams) {
        return this._show(params);
    }

    /**
     * 隐藏应用，params.data会传递给SappSDK onHide回调
     *
     * @param {SappHideParams} [params]
     * @returns
     * @memberof Sapp
     */
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

    /**
     * 隐藏应用；具有防重入处理；result将会传递给SappSDK onClose回调；
     *
     * @param {SappCloseResult} result
     * @memberof Sapp
     */
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

    /**
     * 获取从应用提供的Service，同步版本
     *
     * @type {ServServiceClient['getService']}
     * @memberof Sapp
     * @example
     * ``` ts
     * // 获取单个服务
     * const serv = app.getService(CommServiceDecl);
     * if (serv) {
     *     serv.func();
     * }
     *
     * or
     *
     * // 同时获取多个服务
     * const { serv } = app.getService({ serv: CommServiceDecl });
     * if (serv) {
     *     serv.func();
     * }
     * ```
     */
    getService: ServServiceClient['getService'] = function(this: Sapp) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]);
    };

    /**
     * 获取从应用提供的Service，与getService区别在于，返回值没有保证是否为undefined
     *
     * @type {ServServiceClient['getServiceUnsafe']}
     * @memberof Sapp
     *
     * @example
     * ``` ts
     * const serv = app.getServiceUnsafe(CommServiceDecl);
     * serv.func(); // 没有 undefined 错误提示
     * ```
     */
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'] = function(this: Sapp) {
        return this.getService.apply(this, arguments);
    };

    /**
     * 获取从应用提供的Service，异步版本
     *
     * @type {ServServiceClient['service']}
     * @memberof Sapp
     *
     * @example
     * ``` ts
     * const serv = await app.service(CommServiceDecl);
     * ```
     */
    service: ServServiceClient['service'] = function(this: Sapp) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPP] Sapp is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    };

    /**
     * 获取从应用提供的Service，回调版本
     *
     * @type {ServServiceClient['serviceExec']}
     * @memberof Sapp
     *
     * @example
     * ``` ts
     * app.serviceExec(CommServiceDecl, (serv) => {
     *     serv.func();
     * });
     * ```
     */
    serviceExec: ServServiceClient['serviceExec'] = function(this: Sapp) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    };

    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['getService']}
     * @memberof Sapp
     */
    getServerService: ServServiceServer['getService'] = function(this: Sapp) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.server.getService(arguments[0]);
    };

    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['getServiceUnsafe']}
     * @memberof Sapp
     */
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'] = function(this: Sapp) {
        return this.getServerService.apply(this, arguments);
    };

    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['service']}
     * @memberof Sapp
     */
    serverService: ServServiceServer['service'] = function(this: Sapp) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPP] Sapp is not started'));
        }

        return this.terminal.server.service.apply(this.terminal.server, arguments);
    };

    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['serviceExec']}
     * @memberof Sapp
     */
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

    /**
     * servkit底层API，获取terminal id
     *
     * @returns
     * @memberof Sapp
     */
    getTerminalId() {
        if (this.terminal) {
            return this.terminal.id;
        }

        return this.config.useTerminalId
            || this.info.options.useTerminalId
            || this.uuid;
    }
}
