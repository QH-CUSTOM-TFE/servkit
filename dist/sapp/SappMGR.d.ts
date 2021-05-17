import { Sapp, SappInfo } from './Sapp';
import { SappController } from './SappController';
import { Servkit } from '../servkit/Servkit';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { ServGlobalServiceManager } from '../servkit/ServGlobalServiceManager';
import { ServServiceConfig, ServServiceReferPattern } from '../service/ServServiceManager';
import { SappACLResolver } from './SappACLResolver';
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
export declare class SappLayoutOptions {
    /**
     * 应用容器元素；如果是一个string，则是元素的选择器
     *
     * @type {(string | HTMLElement)}
     * @memberof SappLayoutOptions
     */
    container?: string | HTMLElement;
    /**
     * 应用容器节点class
     *
     * @type {string}
     * @memberof SappLayoutOptions
     */
    className?: string;
    /**
     * 应用容器节点style
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
export declare class SappMGR {
    protected infos: {
        [key: string]: SappInfo;
    };
    protected apps: {
        [key: string]: Sapp[];
    };
    protected config: SappMGRConfig;
    constructor();
    setConfig(config: SappMGRConfig): this;
    getServkit(): Servkit;
    /**
     * 获取全局服务，参见Sapp.getService
     *
     * @type {ServGlobalServiceManager['getService']}
     * @memberof SappMGR
     */
    getService: ServGlobalServiceManager['getService'];
    /**
     * 获取全局服务，参见Sapp.getServiceUnsafe
     *
     * @type {ServGlobalServiceManager['getServiceUnsafe']}
     * @memberof SappMGR
     */
    getServiceUnsafe: ServGlobalServiceManager['getServiceUnsafe'];
    /**
     * 获取全局服务，参见Sapp.service
     *
     * @type {ServGlobalServiceManager['service']}
     * @memberof SappMGR
     */
    service: ServGlobalServiceManager['service'];
    /**
     * 获取全局服务，参见Sapp.serviceExec
     *
     * @type {ServGlobalServiceManager['serviceExec']}
     * @memberof SappMGR
     */
    serviceExec: ServGlobalServiceManager['serviceExec'];
    /**
     * 添加服务到全局服务中，全局服务可以被任意从应用使用
     *
     * @type {ServGlobalServiceManager['addServices']}
     * @memberof SappMGR
     */
    addServices: ServGlobalServiceManager['addServices'];
    /**
     * 移除全局服务
     *
     * @type {ServGlobalServiceManager['remServices']}
     * @memberof SappMGR
     */
    remServices: ServGlobalServiceManager['remServices'];
    getConfig(): SappMGRConfig;
    /**
     * 根据id获取Sapp实例
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    getApp(id: string): Sapp;
    /**
     * 根据id获取所有的Sapp实例
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    getApps(id: string): Sapp[];
    /**
     * 根据id获取SappInfo
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    getAppInfo(id: string): SappInfo;
    /**
     * 添加SappInfo到管理器中
     *
     * @param {SappInfo} info
     * @returns {(SappInfo | undefined)}
     * @memberof SappMGR
     */
    addAppInfo(info: SappInfo): SappInfo | undefined;
    /**
     * 根据id移除SappInfo
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    remAppInfo(id: string): SappInfo;
    /**
     * 根据id获取SappInfo，如果SappMGR.getAppInfo不能获取，则尝试通过SappConfig.loadAppInfo进行加载
     *
     * @param {string} id
     * @returns {(Promise<SappInfo | undefined>)}
     * @memberof SappMGR
     */
    loadAppInfo(id: string): Promise<SappInfo | undefined>;
    /**
     * 预加载一个应用，只有SappType.ASYNC_LOAD应用才能够预加载
     *
     * @param {(string | SappInfo)} id
     * @returns {Promise<boolean>}
     * @memberof SappMGR
     */
    preload(id: string | SappInfo): Promise<boolean>;
    /**
     * 根据id或者info创建一个应用；默认应用会自动start，可通过options.dontStartOnCreate控制是否自动start应用
     *
     * @param {(string | SappInfo)} id
     * @param {SappCreateOptions} [options]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    create(id: string | SappInfo, options?: SappCreateOptions): Promise<Sapp>;
    /**
     * 根据id显示应用
     *
     * @param {string} id
     * @param {SappShowParams} [params]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    show(id: string, params?: SappShowParams): Promise<Sapp>;
    /**
     * 根据id隐藏应用
     *
     * @param {string} id
     * @param {SappHideParams} [params]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    hide(id: string, params?: SappHideParams): Promise<Sapp>;
    /**
     * 根据id关闭应用
     *
     * @param {string} id
     * @param {SappCloseResult} [result]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    close(id: string, result?: SappCloseResult): Promise<Sapp>;
    /**
     * 根据id创建或者显示应用；如果应用不存在则创建应用，如果应用已经存在则隐藏应用
     *
     * @param {string} id
     * @param {SappCreateOptions} [options]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    createOrShow(id: string, options?: SappCreateOptions): Promise<Sapp>;
    protected addApp(app: Sapp): boolean;
    protected remApp(app: Sapp): boolean;
    protected nextAppUuid(info: SappInfo): string;
    protected createApp(uuid: string, info: SappInfo, options: SappCreateOptions): Sapp;
    protected createAppController(app: Sapp, options: SappCreateOptions): SappController;
    protected createDefaultAppController(app: Sapp): SappController;
    /**
     * 创建SappMGR实例
     *
     * @static
     * @param {SappMGRConfig} [config={}]
     * @returns {SappMGR}
     * @memberof SappMGR
     */
    static create(config: SappMGRConfig): SappMGR;
}
/**
 * 全局SappMGR实例
 */
export declare const sappMGR: SappMGR;
