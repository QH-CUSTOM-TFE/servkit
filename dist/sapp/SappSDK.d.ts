import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import { Servkit } from '../servkit/Servkit';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappShowParams, SappHideParams, SappOnShowResult, SappOnHideResult, SappOnCloseResult } from './service/s/SappLifecycle';
import { SappShowParams as ShowParams, SappHideParams as HideParams, SappAuthParams as AuthParams } from './service/m/SappLifecycle';
import { Deferred } from '../common/Deferred';
import { SappSDKMock, SappSDKMockConfig } from './SappSDKMock';
import { ESappType } from './Sapp';
import { ServServiceConfig, ServServiceReferPattern } from '../service/ServServiceManager';
import { EventEmitter } from 'eventemitter3';
/**
 * SappSDK启动参数
 */
export interface SappSDKStartParams {
    uuid?: string;
}
export declare enum ESappSDKLifeCycleEvent {
    BEFORE_START = "BEFORE_START",
    ON_CREATE = "ON_CREATE",
    ON_SHOW = "ON_SHOW",
    ON_HIDE = "ON_HIDE",
    ON_CLOSE = "ON_CLOSE",
    AFTER_START = "AFTER_START"
}
export interface SappSDKAsyncLoadStartParams extends SappSDKStartParams {
    container?: HTMLElement;
}
export interface SappSDKAsyncLoadDeclParams {
    bootstrap: (sdk: SappAsyncLoadSDK) => void;
    deBootstrap?: (sdk: SappAsyncLoadSDK) => void;
}
export interface SappSDKAsyncLoadDeclContext {
    bootstrap: () => void;
    deBootstrap: () => void;
}
/**
 * SappSDK配置
 */
export interface SappSDKConfig {
    /**
     * SappSDK底层Servkit，默认使用全局的servkit
     */
    servkit?: Servkit;
    /**
     * 通信的terminal id；SappSDK仍然采用的是ServTerminal作为双端通信，该双端通信基于一个id进行匹配
     *
     * @type {string}
     * @memberof SappSDKConfig
     */
    useTerminalId?: string;
    /**
     * SappSDK权限认证信息
     *
     * @memberof SappSDKConfig
     */
    authInfo?: AuthParams | ((sdk: SappSDK) => AuthParams | Promise<AuthParams>);
    /**
     * SappSDK.start() 前置回调
     * @param sdk
     */
    beforeStart?(sdk: SappSDK): Promise<void>;
    /**
     * SappSDK启动参数的构造回调；
     * 优先使用SappSDKStartOptions.params，其次SappSDKConfig.resolveStartParams，默认使用parseQueryParams；
     * parseQueryParams将会从window.location.href中解析query参数
     * @param sdk
     */
    resolveStartParams?(sdk: SappSDK): Promise<SappSDKStartParams> | SappSDKStartParams;
    /**
     * ServiceServerConfig的构造回调
     * @param sdk
     */
    resolveServiceServerConfig?(sdk: SappSDK): Promise<ServServiceServerConfig> | ServServiceServerConfig;
    /**
     * ServiceClientConfig的构造回调
     * @param sdk
     */
    resolveServiceClientConfig?(sdk: SappSDK): Promise<ServServiceClientConfig> | ServServiceClientConfig;
    /**
     * SessionConfig的构造回调
     * @param sdk
     */
    resolveSessionConfig?(sdk: SappSDK): Promise<ServSessionConfig> | ServSessionConfig;
    /**
     * 在SappSDK中使用ServTerminal作为服务通信的桥接，ServTerminalConfig会通过该回调做最终的config调整
     * @param sdk
     * @param config
     */
    resolveTerminalConfig?(sdk: SappSDK, config: ServTerminalConfig): Promise<ServTerminalConfig> | ServTerminalConfig | void;
    /**
     * SappSDK.start() 后置回调
     * @param sdk
     */
    afterStart?(sdk: SappSDK): Promise<void>;
    /**
     * 生命周期回调，应用创建时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<void>}
     * @memberof SappSDKConfig
     */
    onCreate?(sdk: SappSDK, params: SappSDKStartParams, data?: any): Promise<void>;
    /**
     * 生命周期回调，应用显示时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<SappOnShowResult | void>}
     * @memberof SappSDKConfig
     */
    onShow?(sdk: SappSDK, params: SappShowParams): Promise<SappOnShowResult | void> | void;
    /**
     * 生命周期回调，应用隐藏时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<SappOnHideResult | void>}
     * @memberof SappSDKConfig
     */
    onHide?(sdk: SappSDK, params: SappHideParams): Promise<SappOnHideResult | void> | void;
    /**
     * 生命周期回调，应用关闭时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<SappOnCloseResult | void>}
     * @memberof SappSDKConfig
     */
    onClose?(sdk: SappSDK): Promise<SappOnCloseResult | void> | void;
    /**
     * SappSDK的mock配置，通过该配置，SappSDK应用可脱离主应用调试开发；
     * 通过window.__$servkit.enableSappSDKMock()或者链接添加__SAPPSDK_MOCK_ENABLE__打开开关才能生效；
     *
     * @type {SappSDKMockConfig}
     * @memberof SappSDKConfig
     */
    mock?: SappSDKMockConfig;
    services?: ServServiceConfig['services'];
    serviceRefer?: ServServiceReferPattern;
}
/**
 * SappSDK start参数项
 */
export interface SappSDKStartOptions {
    params?: SappSDKStartParams | SappSDKConfig['resolveStartParams'];
}
/**
 * SappSDK是为Servkit应用提供的一个SDK
 */
export declare class SappSDK extends EventEmitter {
    /**
     * SDK是否已经初始化
     *
     * @type {boolean}
     * @memberof SappSDK
     */
    isStarted: boolean;
    /**
     * SDK start deffered Promise；在业务层面可以使用sappSDK.started去等待SDK的初始化（也可以直接使用SappSDK.start()这种形式）
     *
     * @type {Deferred}
     * @memberof SappSDK
     */
    started: Deferred;
    /**
     * 内部服务通信桥梁，建议不要直接使用
     *
     * @type {ServTerminal}
     * @memberof SappSDK
     */
    terminal: ServTerminal;
    /**
     *
     *
     * @type {SappSDKMock}
     * @memberof SappSDK
     */
    sdkMock: SappSDKMock;
    protected config: SappSDKConfig;
    constructor();
    /**
     * SappSDK的全局配置，需要在start之前设定好
     *
     * @param {SappSDKConfig} config
     * @returns this
     * @memberof SappSDK
     */
    setConfig(config: SappSDKConfig): this;
    /**
     * 获取全局配置
     *
     * @returns
     * @memberof SappSDK
     */
    getConfig(): SappSDKConfig;
    /**
     * 获取SappSDK使用的servkit
     *
     * @returns
     * @memberof SappSDK
     */
    getServkit(): Servkit;
    /**
     * 启动SDK
     *
     * @param {SappSDKStartOptions} [options]
     * @returns {Promise<void>}
     * @memberof SappSDK
     */
    start: ((options?: SappSDKStartOptions | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    show(params?: ShowParams): Promise<boolean>;
    hide(params?: HideParams): Promise<boolean>;
    close(): Promise<boolean>;
    /**
     * 获取service
     *
     * @type {ServServiceClient['getService']}
     * @memberof SappSDK
     */
    getService: ServServiceClient['getService'];
    /**
     * 获取service；返回类型没有保证service一定存在，但类型上没有做强制处理，因此为unsafe形式
     *
     * @type {ServServiceClient['getServiceUnsafe']}
     * @memberof SappSDK
     */
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'];
    /**
     * 获取service，promise形式；如果某个service不存在，promise将reject
     *
     * @type {ServServiceClient['service']}
     * @memberof SappSDK
     */
    service: ServServiceClient['service'];
    /**
     * 获取service，callback形式；如果某个service不存在，callback将得不到调用
     *
     * @type {ServServiceClient['serviceExec']}
     * @memberof SappSDK
     */
    serviceExec: ServServiceClient['serviceExec'];
    /**
     * 获取server提供的service
     *
     * @type {ServServiceServer['getService']}
     * @memberof SappSDK
     */
    getServerService: ServServiceServer['getService'];
    /**
     * 获取server提供的service；返回类型没有保证service一定存在，但类型上没有做强制处理，因此为unsafe形式
     *
     * @type {ServServiceServer['getServiceUnsafe']}
     * @memberof SappSDK
     */
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'];
    /**
     * 获取server提供的service，promise形式；如果某个service不存在，promise将reject
     *
     * @type {ServServiceServer['service']}
     * @memberof SappSDK
     */
    serverService: ServServiceServer['service'];
    /**
     * 获取server提供的service，callback形式；如果某个service不存在，callback将得不到调用
     *
     * @type {ServServiceServer['serviceExec']}
     * @memberof SappSDK
     */
    serverServiceExec: ServServiceServer['serviceExec'];
    protected beforeStart(options: SappSDKStartOptions): Promise<void>;
    protected afterStart(): Promise<void>;
    protected onStartFailed(): void;
    protected resolveStartParams(options: SappSDKStartOptions): Promise<SappSDKStartParams>;
    protected beforeInitTerminal(): Promise<void>;
    protected initTerminal(options: SappSDKStartOptions, params: SappSDKStartParams): Promise<void>;
    protected afterInitTerminal(): Promise<void>;
    protected initSDK(): Promise<void>;
    protected initSDKMock(): Promise<void>;
    protected onCreate(params: SappSDKStartParams, data: any): Promise<void>;
    protected onShow(params: SappShowParams): Promise<void | SappOnShowResult>;
    protected onHide(params: SappHideParams): Promise<void | SappOnHideResult>;
    protected onClose(): Promise<void | SappOnCloseResult>;
    getAppType(): ESappType;
    getDefaultStartParams(): SappSDKStartParams | undefined;
    static declAsyncLoad(appId: string, params: SappSDKAsyncLoadDeclParams): void;
}
export declare class SappAsyncLoadSDK extends SappSDK {
    protected appId: string;
    constructor(appId: string);
    getAppId(): string;
    getAppType(): ESappType;
    getDefaultStartParams(): SappSDKAsyncLoadStartParams | undefined;
}
export declare const sappSDK: SappSDK;
