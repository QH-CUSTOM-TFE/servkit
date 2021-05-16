import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappShowParams, SappHideParams, SappCloseResult, SappAuthParams } from './service/m/SappLifecycle';
import { SappMGR } from './SappMGR';
import { Deferred } from '../common/Deferred';
import { AsyncMutex } from '../common/AsyncMutex';
import { SappController } from './SappController';
import { SappACLResolver } from './SappACLResolver';
/**
 * Sapp创建策略，当应用重复创建时，使用该枚举值进行控制
 */
export declare enum ESappCreatePolicy {
    NONE = 0,
    /**
     * 单例模式，重复创建应用会失败；默认值
     */
    SINGLETON = 1,
    /**
     * 无限模式，可以创建任意多应用实例
     */
    INFINITE = 2
}
/**
 * Sapp在隐藏时的生命管理策略；对于一些加载敏感的应用，可以使用显示/隐藏来提高应用的加载体验；而如果应用占优资源较多，隐藏时间过长时，则可以基于该枚举来控制是否直接关闭应用而释放资源
 */
export declare enum ESappLifePolicy {
    NONE = 0,
    /**
     * 手动模式，在隐藏后，需要显式关闭应用；默认值
     */
    MANUAL = 1,
    /**
     * 自动模式，在隐藏超过lifeMaxHideTime时间后，应用自动被关闭
     */
    AUTO = 2
}
/**
 * Sapp类型
 */
export declare enum ESappType {
    /**
     * 基于IFrame的应用，应用运行在一个IFrame Web上下文，与主应用运行环境完全隔离；默认值
     */
    IFRAME = "IFRAME",
    /**
     * 基于异步机制的应用，应用与主应用运行在同一个Web环境；
     */
    ASYNC_LOAD = "ASYNC_LOAD"
}
/**
 * Sapp信息
 */
export declare class SappInfo {
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
    resolveTerminalConfig?(app: Sapp, config: ServTerminalConfig): Promise<ServTerminalConfig> | ServTerminalConfig | void;
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
export declare class Sapp {
    static transformContentByInfo(content: string, info: SappInfo): string;
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
    protected mutex: AsyncMutex;
    protected showHideMutex: AsyncMutex;
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
    constructor(uuid: string, info: SappInfo, manager: SappMGR);
    attachController(controller: SappController): boolean;
    detachController(): void;
    /**
     * 获取应用关联的Controller
     *
     * @returns
     * @memberof Sapp
     */
    getController(): SappController | undefined;
    setConfig(config: SappConfig): this;
    getConfig(): SappConfig;
    getServkit(): import("..").Servkit;
    /**
     * 启动应用；具有防重入处理，重复的调用会得到第一次调用返回的Promise对象
     *
     * @param {SappStartOptions} options
     * @memberof Sapp
     */
    start: ((options?: SappStartOptions | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    /**
     * 获取应用类型
     *
     * @returns {ESappType}
     * @memberof Sapp
     */
    getAppType(): ESappType;
    /**
     * 显示应用，params.data会传递给SappSDK onShow回调
     *
     * @param {SappShowParams} [params]
     * @returns
     * @memberof Sapp
     */
    show(params?: SappShowParams): Promise<boolean>;
    /**
     * 隐藏应用，params.data会传递给SappSDK onHide回调
     *
     * @param {SappHideParams} [params]
     * @returns
     * @memberof Sapp
     */
    hide(params?: SappHideParams): Promise<boolean>;
    protected _show: ((params?: SappShowParams | undefined, byCreate?: boolean | undefined) => Promise<boolean>) & {
        deferred: Deferred<void> | undefined;
    };
    protected _hide: ((params?: SappHideParams | undefined, byClose?: boolean | undefined) => Promise<boolean>) & {
        deferred: Deferred<void> | undefined;
    };
    /**
     * 隐藏应用；具有防重入处理；result将会传递给SappSDK onClose回调；
     *
     * @param {SappCloseResult} result
     * @memberof Sapp
     */
    close: ((result?: SappCloseResult | undefined) => Promise<boolean>) & {
        deferred: Deferred<void> | undefined;
    };
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
    getService: ServServiceClient['getService'];
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
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'];
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
    service: ServServiceClient['service'];
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
    serviceExec: ServServiceClient['serviceExec'];
    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['getService']}
     * @memberof Sapp
     */
    getServerService: ServServiceServer['getService'];
    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['getServiceUnsafe']}
     * @memberof Sapp
     */
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'];
    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['service']}
     * @memberof Sapp
     */
    serverService: ServServiceServer['service'];
    /**
     * 获取主应用向从应用提供的服务
     *
     * @type {ServServiceServer['serviceExec']}
     * @memberof Sapp
     */
    serverServiceExec: ServServiceServer['serviceExec'];
    protected auth(params: SappAuthParams): Promise<void>;
    protected beforeStart(options: SappStartOptions): Promise<void>;
    protected afterStart(): Promise<void>;
    protected onStartFailed(): void;
    protected resolveStartData(options: SappStartOptions): Promise<any>;
    protected resolveStartShowData(options: SappStartOptions): Promise<any>;
    protected beforeInitTerminal(): Promise<void>;
    protected initTerminal(options: SappStartOptions): Promise<void>;
    protected afterInitTerminal(): Promise<void>;
    /**
     * servkit底层API，获取terminal id
     *
     * @returns
     * @memberof Sapp
     */
    getTerminalId(): string;
}
