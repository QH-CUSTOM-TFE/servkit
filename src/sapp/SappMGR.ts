import { Sapp, SappInfo, ESappCreatePolicy, ESappType, ESappLifePolicy } from './Sapp';
import { SappController } from './SappController';
import { Servkit, servkit } from '../servkit/Servkit';
import { SappDefaultIFrameController } from './SappDefaultIFrameController';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { nextUUID, asyncThrow, EServConstant } from '../common/common';
import { SappPlainPage } from './SappPlainPage';
import { ServGlobalServiceManager } from '../servkit/ServGlobalServiceManager';
import { SappDefaultAsyncLoadController } from './SappDefaultAsyncLoadController';
import { SappPreloader } from './SappPreloader';
import { ServServiceConfig, ServServiceReferPattern } from '../service/ServServiceManager';
import { SappACLResolver } from './SappACLResolver';
import { SappHostPage, SappHostOnCloseHandle } from './SappHostPage';
import { SappDefaultHostPageController } from './SappDefaultHostPageController';

const DEFAULT_APP_INFO_OPTIONS: SappInfo['options'] = {
    create: ESappCreatePolicy.SINGLETON,
    life: ESappLifePolicy.MANUAL,
};

const DEFAULT_APP_INFO: SappInfo = {
    id: '',
    version: '',
    name: '',
    type: ESappType.IFRAME,
    url: '',
    options: DEFAULT_APP_INFO_OPTIONS,
};

/**
 * Sapp布局配置项
 *
 * @export
 * @class SappLayoutOptions
 * 
 * @example
 * ``` ts
 * // layout管理容器元素
 * const container = document.createElement('div');
 * // some code to config container class and style
 * ...
 * // 实际的layout options
 * const layout = {
 *     container,
 *     onStart: () => { document.body.appendChild(container); },
 *     onClose: () => { document.body.removeChild(container); }
 * };
 * 
 * ```
 */
export class SappLayoutOptions {
    /**
     * 应用容器元素；如果是一个string，则是元素的选择器
     *
     * @type {(string | HTMLElement)}
     * @memberof SappLayoutOptions
     */
    container?: string | HTMLElement;
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
    doStart?: ((app: Sapp) => void);
    /**
     * 应用show回调，对于布局而言，可以在这里将容器元素真正的显示可见
     *
     * @memberof SappLayoutOptions
     */
    doShow?: ((app: Sapp) => void);
    /**
     * 应用show回调，对于布局而言，可以在这里将容器元素真正的隐藏
     *
     * @memberof SappLayoutOptions
     */
    doHide?: ((app: Sapp) => void);
    /**
     * 应用close回调，对于布局而言，可以在这里将容器元素真正的从document移除
     *
     * @memberof SappLayoutOptions
     */
    doClose?: ((app: Sapp) => void);
    /**
     * 容器元素显示时的class
     *
     * @type {string}
     * @memberof SappLayoutOptions
     */
    showClassName?: string;
    /**
     * 容器元素显示时的style
     *
     * @type {Partial<HTMLElement['style']>}
     * @memberof SappLayoutOptions
     */
    showStyle?: Partial<HTMLElement['style']>;
    /**
     * 容器元素隐藏时的class
     *
     * @type {string}
     * @memberof SappLayoutOptions
     */
    hideClassName?: string;
    /**
     * 容器元素隐藏时的style
     *
     * @type {Partial<HTMLElement['style']>}
     * @memberof SappLayoutOptions
     */
    hideStyle?: Partial<HTMLElement['style']>;
}

/**
 * SappMGR createHost参数
 */
export interface SappHostCreateOptions {
    /**
     * create时不要自动启动应用；即不要调用Sapp.start
     *
     * @type {boolean}
     * @memberof SappHostCreateOptions
     */
     dontStartOnCreate?: boolean;
     /**
      * 应用Controller创建回调；默认会自动创建一个Default Controller
      *
      * @param {SappMGR} mgr
      * @param {Sapp} app
      * @returns {SappController}
      * @memberof SappHostCreateOptions
      */
     createAppController?(mgr: SappMGR, app: Sapp): SappController;
     /**
      * 应用 Service ACL 权限管理创建回调；默认无ACL权限管理
      *
      * @param {Sapp} app
      * @returns {SappACLResolver}
      * @memberof SappHostCreateOptions
      */
     createACLResolver?(app: Sapp): SappACLResolver;
     
    /**
     * 配置主应用向从应用提供的服务
     *
     * @type {ServServiceConfig['services']}
     * @memberof SappHostCreateOptions
     */
    services?: ServServiceConfig['services'];

    /**
     * 配置主应用向从应用提供的引用型服务；引用型服务由Global Service Manager提供；
     *
     * @type {ServServiceReferPattern}
     * @memberof SappHostCreateOptions
     */
     serviceRefer?: ServServiceReferPattern;

     /**
      * Host应用在关闭前的拦截函数，在这里面可以进行完成：
      * 1：关闭处理逻辑
      * 2：或者打断关闭逻辑，通过返回值 SappHostOnCloseResult.dontClose 进行控制
      *
      * @type {SappHostOnCloseHandle}
      * @memberof SappHostCreateOptions
      */
     onCloseHandle?: SappHostOnCloseHandle;
}

/**
 * SappMGR create参数
 *
 * @export
 * @interface SappCreateOptions
 */
export interface SappCreateOptions {
    /**
     * create时不要自动启动应用；即不要调用Sapp.start
     *
     * @type {boolean}
     * @memberof SappCreateOptions
     */
    dontStartOnCreate?: boolean;
    /**
     * 应用Controller创建回调；默认会自动创建一个Default Controller
     *
     * @param {SappMGR} mgr
     * @param {Sapp} app
     * @returns {SappController}
     * @memberof SappCreateOptions
     */
    createAppController?(mgr: SappMGR, app: Sapp): SappController;
    /**
     * 应用 Service ACL 权限管理创建回调；默认无ACL权限管理
     *
     * @param {Sapp} app
     * @returns {SappACLResolver}
     * @memberof SappCreateOptions
     */
    createACLResolver?(app: Sapp): SappACLResolver;
    /**
     * 应用布局配置
     *
     * @memberof SappCreateOptions
     */
    layout?: SappLayoutOptions | ((app: Sapp) => SappLayoutOptions);
    /**
     * 应用启动传递到SappSDK的数据，参见SappConfig.resolveStartData
     *
     * @memberof SappCreateOptions
     */
    startData?: any | ((app: Sapp) => any);
    /**
     * 应用显示传递到SappSDK的数据，参见SappConfig.resolveStartShowData
     *
     * @memberof SappCreateOptions
     */
    startShowData?: any | ((app: Sapp) => any);
    /**
     * 配置主应用向从应用提供的服务
     *
     * @type {ServServiceConfig['services']}
     * @memberof SappCreateOptions
     */
    services?: ServServiceConfig['services'];
    /**
     * 配置主应用向从应用提供的引用型服务；引用型服务由Global Service Manager提供；
     *
     * @type {ServServiceReferPattern}
     * @memberof SappCreateOptions
     */
    serviceRefer?: ServServiceReferPattern;
    /**
     * start超时配置，参见SappConfig.startTimeout
     *
     * @type {number}
     * @memberof SappCreateOptions
     */
    startTimeout?: number;
    /**
     * 主从应用通信配对ID，参见SappConfig.useTerminalId
     *
     * @type {string}
     * @memberof SappCreateOptions
     */
    useTerminalId?: string;
}

/**
 * SappMGR 配置
 *
 * @export
 * @interface SappMGRConfig
 */
export interface SappMGRConfig {
    /**
     * SappMGR对应使用的servkit；默认使用全局servkit
     *
     * @type {Servkit}
     * @memberof SappMGRConfig
     */
    servkit?: Servkit;
    /**
     * 通用的 Sapp Controler 构造函数
     *
     * @param {SappMGR} mgr
     * @param {Sapp} app
     * @returns {SappController}
     * @memberof SappMGRConfig
     */
    createAppController?(mgr: SappMGR, app: Sapp): SappController;
    /**
     * 通用的 Sapp Service ACL 权限管理构造函数
     *
     * @param {Sapp} app
     * @returns {SappACLResolver}
     * @memberof SappMGRConfig
     */
    createACLResolver?(app: Sapp): SappACLResolver;
    /**
     * SappInfo加载函数
     *
     * @param {SappMGR} mgr
     * @param {string} id
     * @returns {(Promise<SappInfo | undefined>)}
     * @memberof SappMGRConfig
     */
    loadAppInfo?(mgr: SappMGR, id: string): Promise<SappInfo | undefined>;
}

/**
 * 应用管理器，主要提供了：
 * 1：Sapp管理
 * 2：全局服务管理
 *
 * @export
 * @class SappMGR
 */
export class SappMGR {
    protected infos: { [key: string]: SappInfo };
    protected apps: { [key: string]: Sapp[] };
    protected config: SappMGRConfig;
    protected hostApp?: SappHostPage;

    constructor() {
        this.infos = {};
        this.apps = {};
        this.setConfig({});
    }

    setConfig(config: SappMGRConfig) {
        this.config = config;

        return this;
    }

    getConfig() {
        return this.config;
    }

    getServkit(): Servkit {
        return this.config.servkit || servkit;
    }

    /**
     * 获取全局服务，参见Sapp.getService
     *
     * @type {ServGlobalServiceManager['getService']}
     * @memberof SappMGR
     */
    getService: ServGlobalServiceManager['getService'] = function(this: SappMGR) {
        const serviceManager = this.getServkit().service;
        return serviceManager.getService.apply(serviceManager, arguments);
    };

    /**
     * 获取全局服务，参见Sapp.getServiceUnsafe
     *
     * @type {ServGlobalServiceManager['getServiceUnsafe']}
     * @memberof SappMGR
     */
    getServiceUnsafe: ServGlobalServiceManager['getServiceUnsafe'] = function(this: SappMGR) {
        const serviceManager = this.getServkit().service;
        return serviceManager.getServiceUnsafe.apply(serviceManager, arguments);
    };

    /**
     * 获取全局服务，参见Sapp.service
     *
     * @type {ServGlobalServiceManager['service']}
     * @memberof SappMGR
     */
    service: ServGlobalServiceManager['service'] = function(this: SappMGR) {
        const serviceManager = this.getServkit().service;
        return serviceManager.service.apply(serviceManager, arguments);
    };

    /**
     * 获取全局服务，参见Sapp.serviceExec
     *
     * @type {ServGlobalServiceManager['serviceExec']}
     * @memberof SappMGR
     */
    serviceExec: ServGlobalServiceManager['serviceExec'] = function(this: SappMGR) {
        const serviceManager = this.getServkit().service;
        return serviceManager.serviceExec.apply(serviceManager, arguments);
    };

    /**
     * 添加服务到全局服务中，全局服务可以被任意从应用使用
     *
     * @type {ServGlobalServiceManager['addServices']}
     * @memberof SappMGR
     */
    addServices: ServGlobalServiceManager['addServices'] = function(this: SappMGR) {
        const serviceManager = this.getServkit().service;
        return serviceManager.addServices.apply(serviceManager, arguments);
    };

    /**
     * 移除全局服务
     *
     * @type {ServGlobalServiceManager['remServices']}
     * @memberof SappMGR
     */
    remServices: ServGlobalServiceManager['remServices'] = function(this: SappMGR) {
        const serviceManager = this.getServkit().service;
        return serviceManager.remServices.apply(serviceManager, arguments);
    };

    /**
     * 根据id获取Sapp实例
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    getApp(id: string) {
        return this.getApps(id)[0];
    }

    /**
     * 根据id获取所有的Sapp实例
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    getApps(id: string) {
        return this.apps[id] || [];
    }

    /**
     * 根据id获取SappInfo
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    getAppInfo(id: string) {
        return this.infos[id];
    }

    /**
     * 添加SappInfo到管理器中
     *
     * @param {SappInfo} info
     * @returns {(SappInfo | undefined)}
     * @memberof SappMGR
     */
    addAppInfo(info: SappInfo): SappInfo | undefined {
        if (!info.id) {
            return;
        }

        const oldInfo = info;
        info = Object.assign({}, DEFAULT_APP_INFO, oldInfo);
        if (oldInfo.options) {
            info.options = Object.assign({}, DEFAULT_APP_INFO_OPTIONS, oldInfo.options);
        }
        if (info.type === ESappType.ASYNC_LOAD) {
            info.options.create = ESappCreatePolicy.SINGLETON;
        }

        this.infos[info.id] = info;

        return info;
    }

    /**
     * 根据id移除SappInfo
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    remAppInfo(id: string) {
        const info = this.infos[id];
        if (!info) {
            return info;
        }

        delete this.infos[id];

        return info;
    }

    /**
     * 根据id获取SappInfo，如果SappMGR.getAppInfo不能获取，则尝试通过SappConfig.loadAppInfo进行加载
     *
     * @param {string} id
     * @returns {(Promise<SappInfo | undefined>)}
     * @memberof SappMGR
     */
    async loadAppInfo(id: string): Promise<SappInfo | undefined> {
        let info: SappInfo | undefined = this.getAppInfo(id);
        if (info) {
            return info;
        }

        if (this.config.loadAppInfo) {
            info = await this.config.loadAppInfo(this, id).catch(() => undefined);
            if (info) {
                this.addAppInfo(info);
            }
        }

        return this.getAppInfo(id);
    }

    /**
     * 预加载一个应用，只有SappType.ASYNC_LOAD应用才能够预加载
     *
     * @param {(string | SappInfo)} id
     * @returns {Promise<boolean>}
     * @memberof SappMGR
     */
    async preload(id: string | SappInfo): Promise<boolean> {
        let info: SappInfo | undefined;
        if (typeof id === 'object') {
            info = id;
            id = id.id;
        }

        const app = this.getApp(id);
        if (app && app.isStarted) {  // Has Create
            return true;
        }

        if (info) {
            info = this.addAppInfo(info);
            if (!info) {
                return false;
            }
        } else {
            info = await this.loadAppInfo(id).catch(() => undefined);
        }

        if (!info) {
            return false;
        }

        if (info.type !== ESappType.ASYNC_LOAD || info.options.isPlainPage) {
            return false;
        }

        return SappPreloader.instance.load(info).then(() => {
            return true;
        }, () => {
            return false;
        });
    }

    /**
     * 创建host应用，host应用是host页面的抽象，可通过host应用与host页面进行交互通信；
     * host应用将在host页面中以IFrame方式嵌入。
     *
     * @param {SappHostCreateOptions} [options]
     * @returns SappHostPage
     * @memberof SappMGR
     */
    createHost(options?: SappHostCreateOptions): SappHostPage {
        if (this.hostApp) {
            return this.hostApp;
        }

        options = options || {};

        const info = {
            id: EServConstant.SHOST_TERMINAL_ID,
            version: '1.0.0',
            type: ESappType.HOST_PAGE,
            url: '',
            options: {},
        };
    
        const appOptions = {
            ...options,
            startTimeout: EServConstant.SHOST_CREATE_TIMEOUT,
        };

        if (!appOptions.createACLResolver && this.config.createACLResolver) {
            appOptions.createACLResolver = this.config.createACLResolver;
        }

        const app = this.createApp(this.nextAppUuid(info), info, appOptions) as SappHostPage;
        this.hostApp = app;

        app.getController()!.doConfig(appOptions);

        if (options.onCloseHandle) {
            app.setOnCloseHandle(options.onCloseHandle);
        }

        if (!options.dontStartOnCreate) {
            // createHost need sync, no await here
            app.start();
        }
        
        return app;
    }

    /**
     * 获取host应用
     *
     * @returns {(SappHostPage | undefined)}
     * @memberof SappMGR
     */
    getHost(): SappHostPage | undefined {
        return this.hostApp;
    }

    /**
     * 关闭host应用
     *
     * @returns
     * @memberof SappMGR
     */
    closeHost() {
        if (!this.hostApp) {
            return;
        }

        return this.hostApp.close();
    }

    /**
     * 返回是否在host页面环境
     *
     * @returns boolean
     * @memberof SappMGR
     */
    isInHostEnv() {
        return SappHostPage.isInHostEnv();
    }

    /**
     * 返回host应用是否已经连接到host页面
     *
     * @returns
     * @memberof SappMGR
     */
    isHostConnected() {
        return this.hostApp && this.hostApp.isStarted; 
    }

    /**
     * 根据id或者info创建一个应用；默认应用会自动start，可通过options.dontStartOnCreate控制是否自动start应用
     *
     * @param {(string | SappInfo)} id
     * @param {SappCreateOptions} [options]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    async create(id: string | SappInfo, options?: SappCreateOptions): Promise<Sapp> {
        if (typeof id === 'object') {
            if (!this.addAppInfo(id)) {
                throw new Error(`[SAPPMGR] App info is invalid`);
            }
            id = id.id;
        }

        let app = this.getApp(id);
        if (app) {
            if (!app.info.options.create || app.info.options.create === ESappCreatePolicy.SINGLETON) {
                throw new Error('singleton');
            }
        }

        const info = await this.loadAppInfo(id);
        if (!info) {
            throw new Error(`[SAPPMGR] App ${id} is not exits`);
        }

        options = options || {};
        if (!options.createACLResolver && this.config.createACLResolver) {
            options.createACLResolver = this.config.createACLResolver;
        }

        app = this.createApp(this.nextAppUuid(info), info, options);

        this.addApp(app);
        app.closed.then(() => {
            this.remApp(app);
        }, () => {
            this.remApp(app);
        });

        app.getController()!.doConfig(options);

        if (!options.dontStartOnCreate && !info.options.dontStartOnCreate) {
            await app.start();
        }

        return app;
    }

    /**
     * 根据id显示应用
     *
     * @param {string} id
     * @param {SappShowParams} [params]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    async show(id: string, params?: SappShowParams): Promise<Sapp> {
        const app = this.getApp(id);
        if (!app) {
            return Promise.reject(new Error(`[SAPPMGR] App ${id} has not created`));
        }

        await app.show(params);

        return app;
    }

    /**
     * 根据id隐藏应用
     *
     * @param {string} id
     * @param {SappHideParams} [params]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    async hide(id: string, params?: SappHideParams): Promise<Sapp> {
        const app = this.getApp(id);
        if (!app) {
            return Promise.reject(new Error(`[SAPPMGR] App ${id} has not created`));
        }

        await app.hide(params);

        return app;
    }

    /**
     * 根据id关闭应用
     *
     * @param {string} id
     * @param {SappCloseResult} [result]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    async close(id: string, result?: SappCloseResult): Promise<Sapp> {
        const app = this.getApp(id);
        if (!app) {
            return Promise.reject(new Error(`[SAPPMGR] App ${id} has not created`));
        }

        await app.close(result);

        return app;
    }

    /**
     * 根据id创建或者显示应用；如果应用不存在则创建应用，如果应用已经存在则隐藏应用
     *
     * @param {string} id
     * @param {SappCreateOptions} [options]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    async createOrShow(id: string, options?: SappCreateOptions): Promise<Sapp> {
        const app = this.getApp(id);
        if (app) {
            const params: SappShowParams = {
                force: true,
            };

            if (options && options.startShowData !== undefined) {
                if (typeof options.startShowData === 'function') {
                    params.data = options.startShowData(app);
                } else {
                    params.data = options.startShowData;
                }
            }
            return this.show(id, params);
        } else {
            return this.create(id, options);
        }
    }

    protected addApp(app: Sapp) {
        let apps = this.apps[app.info.id];
        if (!apps) {
            apps = [];
            this.apps[app.info.id] = apps;
        } else {
            if (apps.indexOf(app) >= 0) {
                return false;
            }
        }

        apps.push(app);

        return true;
    }

    protected remApp(app: Sapp) {
        const apps = this.apps[app.info.id];
        if (!apps) {
            return false;
        }

        const i = apps.indexOf(app);
        if (i >= 0) {
            apps.splice(i, 1);
            return true;
        }

        return false;
    }

    protected nextAppUuid(info: SappInfo) {
        return `${info.id}-${nextUUID()}`;
    }

    protected createApp(uuid: string, info: SappInfo, options: SappCreateOptions): Sapp {
        const app = info.type === ESappType.HOST_PAGE ? new SappHostPage(uuid, info, this) 
                    : info.options.isPlainPage ? new SappPlainPage(uuid, info, this)
                    : new Sapp(uuid, info, this);
        this.createAppController(app, options);

        return app;
    }

    protected createAppController(app: Sapp, options: SappCreateOptions) {
        if (options.createAppController) {
            return options.createAppController(this, app);
        }

        if (this.config.createAppController) {
            return this.config.createAppController(this, app);
        }

        return this.createDefaultAppController(app);
    }

    protected createDefaultAppController(app: Sapp): SappController {
        return app.info.type === ESappType.ASYNC_LOAD ? new SappDefaultAsyncLoadController(app)
            : app.info.type === ESappType.HOST_PAGE ? new SappDefaultHostPageController(app)
            : new SappDefaultIFrameController(app);
    }

    /**
     * 创建SappMGR实例
     *
     * @static
     * @param {SappMGRConfig} [config={}]
     * @returns {SappMGR}
     * @memberof SappMGR
     */
    static create(config: SappMGRConfig): SappMGR {
        const mgr = new SappMGR();
        mgr.setConfig(config);

        return mgr;
    }
}

let sInstance: SappMGR = undefined!;

try {
    sInstance = new SappMGR();
} catch (e) {
    asyncThrow(e);
}

/**
 * 全局SappMGR实例
 */
export const sappMGR = sInstance;
