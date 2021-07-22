import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServServiceServer } from '../service/ServServiceServer';
import { asyncThrow, EServConstant } from '../common/common';
import { EServChannel } from '../session/channel/ServChannel';
import { servkit, Servkit } from '../servkit/Servkit';
import { anno, ServAPIArgs } from '../service/ServService';
import { ServServiceClient } from '../service/ServServiceClient';
import {
    SappOnCloseResult,
} from './service/s/SappLifecycle';
import { Deferred, DeferredUtil } from '../common/Deferred';
import { ServServiceConfig } from '../service/ServServiceManager';
import { EventEmitter } from 'eventemitter3';
import { SappHostInfo, SappHostPageService } from './service/s/SappHostPageService';
import { SappHostPageService as HostPageService } from './service/m/SappHostPageService';
import { AsyncMutex } from '../common/AsyncMutex';

/**
 * SHOSTSDK生命周期事件
 *
 * @export
 * @enum {number}
 */
export enum EShostSDKLifeCycleEvent {
    ON_CREATE = 'ON_CREATE',
    ON_CLOSE = 'ON_CLOSE',
}

export interface ShostLayoutOptions {
    /**
     * 应用容器元素；如果是一个string，则是元素的选择器
     *
     * @type {HTMLElement}
     * @memberof SappLayoutOptions
     */
    container?: HTMLElement;
    /**
     * iframe节点class；只对ESappType.IFRAME有效
     *
     * @type {string}
     * @memberof SappLayoutOptions
     */
    className?: string;
    /**
     * iframe节点style；只对ESappType.IFRAME有效
     *
     * @type {string}
     * @memberof SappLayoutOptions
     */
    style?: Partial<HTMLElement['style']>;
    /**
     * 应用start回调，对于布局而言，可以在这里将容器元素真正的append到document上
     *
     * @memberof SappLayoutOptions
     */
    doStart?: ((sdk: ShostSDK) => void);
    /**
     * 应用close回调，对于布局而言，可以在这里将容器元素真正的从document移除
     *
     * @memberof SappLayoutOptions
     */
    doClose?: ((sdk: ShostSDK) => void);
}

/**
 * Host页面内嵌入的iframe信息
 *
 * @export
 * @interface ShostContentPageInfo
 */
export interface ShostContentPageInfo {
    /**
     * 容器DOM节点
     *
     * @type {HTMLElement}
     * @memberof ShostContentPageInfo
     */
    container: HTMLElement;
    /**
     * IFrame DOM节点
     *
     * @type {HTMLIFrameElement}
     * @memberof ShostContentPageInfo
     */
    element: HTMLIFrameElement;
    /**
     * IFrame的布局信息
     *
     * @type {ShostLayoutOptions}
     * @memberof ShostContentPageInfo
     */
    layout?: ShostLayoutOptions;
}

/**
 * SHOSTSDK配置
 */
export interface ShostSDKConfig {
    /**
     * SHOSTSDK底层Servkit，默认使用全局的servkit
     */
    servkit?: Servkit;

    /**
     * host页面提供的数据接口
     *
     * @memberof ShostSDKConfig
     */
    hostData?: any | ((params: any) => any | Promise<any>);

    /**
     * host页面提供的信息接口
     *
     * @memberof SHOSTSDKConfig
     */
    hostInfo?: SappHostInfo | ((sdk: ShostSDK) => SappHostInfo | Promise<SappHostInfo>);

    /**
     * IFrame布局配置
     *
     * @type {ShostLayoutOptions}
     * @memberof ShostSDKConfig
     */
    layout?: ShostLayoutOptions;

    /**
     * IFrame页面URL构造接口
     *
     * @memberof ShostSDKConfig
     */
    resolveContentPageUrl?: (options: ShostSDKStartOptions) => string;

    /**
     * 生命周期回调，应用创建时回调
     *
     * @param {SHOSTSDK} sdk
     * @returns {Promise<void>}
     * @memberof SHOSTSDKConfig
     */
    onCreate?(sdk: ShostSDK): Promise<void>;

    /**
     * 生命周期回调，应用关闭时回调
     *
     * @param {SHOSTSDK} sdk
     * @returns {Promise<SappOnCloseResult | void>}
     * @memberof SHOSTSDKConfig
     */
    onClose?(sdk: ShostSDK): Promise<SappOnCloseResult | void> | void;

    /**
     * 从应用向主应用提供的服务
     *
     * @type {ServServiceConfig['services']}
     * @memberof SHOSTSDKConfig
     */
    services?: ServServiceConfig['services'];
}

/**
 * SHOSTSDK start参数项
 */
export interface ShostSDKStartOptions {
    layout?: ShostLayoutOptions;
}

/**
 * SHOSTSDK是从应用与主应用交互的桥梁，也是从应用自身的抽象；
 * 主要提供了：
 * 1：自身生命周期管理
 * 2：与主应用的交互接口，获取服务API
 *
 * @export
 * @class SHOSTSDK
 * @extends {EventEmitter}
 */
export class ShostSDK extends EventEmitter {
    /**
     * SDK是否已经初始化
     *
     * @type {boolean}
     * @memberof SHOSTSDK
     */
    isStarted: boolean;

    /**
     * SDK start deffered Promise；在业务层面可以使用SHOSTSDK.started去等待SDK的初始化（也可以直接使用SHOSTSDK.start()这种形式）
     *
     * @type {Deferred}
     * @memberof SHOSTSDK
     */
    started: Deferred;

    /**
     * 内部服务通信桥梁，建议不要直接使用
     *
     * @type {ServTerminal}
     * @memberof SHOSTSDK
     */
    terminal: ServTerminal;

    protected contentInfo?: ShostContentPageInfo;
    protected mutex = new AsyncMutex();
    protected config: ShostSDKConfig;

    constructor() {
        super();

        this.started = DeferredUtil.create();
        this.setConfig({
            // Default Config
        });
    }

    /**
     * SHOSTSDK的全局配置，需要在start之前设定好
     *
     * @param {SHOSTSDKConfig} config
     * @returns this
     * @memberof SHOSTSDK
     */
    setConfig(config: ShostSDKConfig) {
        this.config = config;

        return this;
    }

    /**
     * 获取全局配置
     *
     * @returns
     * @memberof SHOSTSDK
     */
    getConfig() {
        return this.config;
    }

    /**
     * 获取SHOSTSDK使用的servkit
     *
     * @returns
     * @memberof SHOSTSDK
     */
    getServkit() {
        return this.config.servkit || servkit;
    }

    /**
     * 启动SDK；具有防重入处理；会触发onCreate回调；
     * 会创建IFrame页面；
     *
     * @param {SHOSTSDKStartOptions} [options]
     * @returns {Promise<void>}
     * @memberof SHOSTSDK
     */
    start = DeferredUtil.reEntryGuard(this.mutex.lockGuard(async (options?: ShostSDKStartOptions): Promise<void> => {
        if (this.isStarted) {
            return;
        }

        const config = this.config;
        if (!config) {
            throw new Error('[SHOSTSDK] Config must be set before setup');
        }

        try {
            options = options || {};

            await this.initTerminal(options);

            this.isStarted = true;

            await this.onCreate();

            this.started.resolve();
        } catch (e) {
            this.onStartFailed();

            this.isStarted = false;
            this.started.reject(e);

            throw e;
        }
    }));

    /**
     * 关闭SDK；具有防重入处理；会触发onCreate回调；
     * IFrame页面会触发onClose回调，并能够打断关闭操作。
     *
     * @memberof ShostSDK
     */
    close = DeferredUtil.reEntryGuard(
        this.mutex.lockGuard(
            async () => {
                if (!this.isStarted) {
                    return true;
                }

                const onCloseResult = await this.service(HostPageService).then((service) => {
                    return service.onClose();
                }).catch((error) => {
                    asyncThrow(error);
                });

                if (onCloseResult && onCloseResult.dontClose) {
                    return false;
                }

                await this.onClose();

                this.releaseTerminal();

                this.isStarted = false;
                this.started = DeferredUtil.create();

                return true;
            }));

    /**
     * 获取主应用提供的Service，同步版本
     *
     * @type {ServServiceClient['getService']}
     * @memberof SHOSTSDK
     * 
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
    getService: ServServiceClient['getService'] = function(this: ShostSDK) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.client.getService(arguments[0]);
    };

    /**
     * 获取从应用提供的Service，与getService区别在于，返回值没有保证是否为undefined
     *
     * @type {ServServiceClient['getServiceUnsafe']}
     * @memberof SHOSTSDK
     * 
     * @example
     * ``` ts
     * const serv = app.getServiceUnsafe(CommServiceDecl);
     * serv.func(); // 没有 undefined 错误提示 
     * ```
     */
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'] = function(this: ShostSDK) {
        return this.getService.apply(this, arguments);
    };

    /**
     * 获取从应用提供的Service，异步版本
     *
     * @type {ServServiceClient['service']}
     * @memberof SHOSTSDK
     * 
     * @example
     * ``` ts
     * const serv = await app.service(CommServiceDecl);
     * ```
     */
    service: ServServiceClient['service'] = function(this: ShostSDK) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SHOSTSDK] SHOSTSDK is not started'));
        }

        return this.terminal.client.service.apply(this.terminal.client, arguments);
    };

    /**
     * 获取从应用提供的Service，回调版本
     *
     * @type {ServServiceClient['serviceExec']}
     * @memberof SHOSTSDK
     * 
     * @example
     * ``` ts
     * app.serviceExec(CommServiceDecl, (serv) => {
     *     serv.func();
     * });
     */
    serviceExec: ServServiceClient['serviceExec'] = function(this: ShostSDK) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    };

    /**
     * 获取从应用向主应用提供的服务
     *
     * @type {ServServiceServer['getService']}
     * @memberof SHOSTSDK
     */
    getServerService: ServServiceServer['getService'] = function(this: ShostSDK) {
        if (!this.isStarted) {
            return;
        }

        return this.terminal.server.getService(arguments[0]);
    };

    /**
     * 获取从应用向主应用提供的服务
     *
     * @type {ServServiceServer['getServiceUnsafe']}
     * @memberof SHOSTSDK
     */
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'] = function(this: ShostSDK) {
        return this.getServerService.apply(this, arguments);
    };

    /**
     * 获取从应用向主应用提供的服务
     *
     * @type {ServServiceServer['service']}
     * @memberof SHOSTSDK
     */
    serverService: ServServiceServer['service'] = function(this: ShostSDK) {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SHOSTSDK] SHOSTSDK is not started'));
        }

        return this.terminal.server.service.apply(this.terminal.server, arguments);
    };

    /**
     * 获取从应用向主应用提供的服务
     *
     * @type {ServServiceServer['serviceExec']}
     * @memberof SHOSTSDK
     */
    serverServiceExec: ServServiceServer['serviceExec'] = function(this: ShostSDK) {
        if (!this.isStarted) {
            return null;
        }

        return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
    };

    protected onStartFailed() {
        this.releaseTerminal();
    }

    protected async initTerminal(options: ShostSDKStartOptions): Promise<void> {
        const config = this.config;

        const terminalConfig: ServTerminalConfig = {
            id: EServConstant.SHOST_APP_ID,
            type: EServTerminal.MASTER,
            session: undefined!,
        };

        // Service server config
        {
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

            if (!terminalConfig.server.serviceRefer) {
                terminalConfig.server.serviceRefer = /.*/;
            }
        }

        terminalConfig.session = {
            channel: {
                type: EServChannel.WINDOW,
                config: {
                    master: {
                        dontWaitEcho: true,
                        createWindow: () => {
                            const contentInfo = this.createContentPage(options);

                            return {
                                target: contentInfo.element.contentWindow,
                                element: contentInfo.element,
                            };
                        },
                        destroyWindow: () => {
                            this.destroyContentPage();
                        },
                    },
                },
            },
        };

        // Rewrite type
        terminalConfig.session.checkSession = false;

        // Check config validation
        if (!terminalConfig.id || !terminalConfig.session) {
            throw new Error('[SHOSTSDK] Invalid terminal config');
        }

        // Setup terminal
        this.terminal = this.getServkit().createTerminal(terminalConfig);

        // Setup host service
        const self = this;
        const SappHostPageServiceImpl = class extends SappHostPageService {
            async getHostInfo() {
                let hostInfo = config.hostInfo || { token: '', id: '' };
                if (typeof hostInfo === 'function') {
                    hostInfo = await hostInfo(self);
                }
                return hostInfo as SappHostInfo;
            }

            async getHostData(p: ServAPIArgs<any>) {
                let hostData = config.hostData;
                if (typeof hostData === 'function') {
                    hostData = await hostData(p);
                }
                return hostData;
            }

            async close() {
                return self.close();
            }
        };
        anno.impl()(SappHostPageServiceImpl);

        this.terminal.server.addServices([{
            decl: SappHostPageService,
            impl: SappHostPageServiceImpl,
        }], {
            lazy: true,
        });

        await this.terminal.openSession();
    }

    protected releaseTerminal() {
        if (this.terminal) {
            const terminal = this.terminal;
            this.terminal = undefined!;
            // give a chance to send back message
            setTimeout(() => {
                terminal.servkit.destroyTerminal(terminal);
            });
        }
    }

    protected async onCreate() {
        if (this.config.onCreate) {
            await this.config.onCreate(this);
        }

        this.emit(EShostSDKLifeCycleEvent.ON_CREATE, this);
    }

    protected async onClose() {
        this.emit(EShostSDKLifeCycleEvent.ON_CLOSE, this);

        if (this.config.onClose) {
            return await this.config.onClose(this);
        }
    }

    protected createContentPage(options: ShostSDKStartOptions) {
        const layout = options.layout || this.config.layout || {};
        if (layout.doStart) {
            layout.doStart(this);
        }
        
        const element: HTMLIFrameElement = document.createElement('iframe');
        element.src = this.resolveContentPageUrl(options);
        if (layout.className) {
            element.className = layout.className;
        }

        if (layout.style) {
            Object.keys(layout.style).forEach((key) => {
                (element.style as any)[key] = (layout.style as any)[key];
            });
        }
        const container = layout.container || document.body;
        container.appendChild(element);

        this.contentInfo = {
            element,
            container,
            layout,
        };

        return this.contentInfo;
    }

    protected destroyContentPage() {
        if (this.contentInfo) {
            this.contentInfo.container.removeChild(this.contentInfo.element);
            if (this.contentInfo.layout && this.contentInfo.layout.doClose) {
                this.contentInfo.layout.doClose(this);
            }

            this.contentInfo = undefined;
        }
    }

    protected resolveContentPageUrl(options: ShostSDKStartOptions): string {
        if (this.config.resolveContentPageUrl) {
            return this.config.resolveContentPageUrl(options);
        }

        throw new Error('[SHOSTSDK] resolveContentPageUrl unsupport');
    }
}

let sInstance: ShostSDK = undefined!;
try {
    sInstance = new ShostSDK();
} catch (e) {
    asyncThrow(e);
}

/**
 * 全局SHOSTSDK
 */
export const shostSDK = sInstance;
