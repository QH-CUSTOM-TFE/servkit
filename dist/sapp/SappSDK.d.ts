import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import { Servkit } from '../servkit/Servkit';
import { ServService } from '../service/ServService';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappShowParams, SappHideParams } from './service/s/SappLifecycle';
import { SappShowParams as ShowParams, SappHideParams as HideParams } from './service/m/SappLifecycle';
import { Deferred } from '../common/Deferred';
/**
 * SappSDK启动参数
 */
export interface SappSDKStartParams {
    uuid?: string;
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
     * @returns {Promise<void>}
     * @memberof SappSDKConfig
     */
    onShow?(sdk: SappSDK, params: SappShowParams): Promise<boolean>;
    /**
     * 生命周期回调，应用隐藏时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<void>}
     * @memberof SappSDKConfig
     */
    onHide?(sdk: SappSDK, params: SappHideParams): Promise<boolean>;
    /**
     * 生命周期回调，应用关闭时回调
     *
     * @param {SappSDK} sdk
     * @returns {Promise<void>}
     * @memberof SappSDKConfig
     */
    onClose?(sdk: SappSDK): Promise<void>;
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
export declare class SappSDK {
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
     * 启动SDK
     *
     * @param {SappSDKStartOptions} [options]
     * @returns {Promise<void>}
     * @memberof SappSDK
     */
    start: ((options?: SappSDKStartOptions | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    show(params?: ShowParams): Promise<void>;
    hide(params?: HideParams): Promise<void>;
    close(): Promise<void>;
    /**
     * 销毁SDK，该方法主要用于CI测试（建议业务不要使用，因为SappSDK生命周期通常与应用程序的生命周期保一致）
     */
    destroy(): void;
    /**
     * 根据服务声明获取服务对象
     *
     * @template T
     * @param {T} decl
     * @returns {(InstanceType<T> | undefined)}
     * @memberof SappSDK
     */
    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    getService<M extends {
        [key: string]: typeof ServService;
    }>(decls: M): {
        [key in keyof M]: InstanceType<M[key]> | undefined;
    };
    /**
     * 根据服务声明获取服务对象；非安全版本，在类型上任务返回的所有服务对象都是存在的，但实际可能并不存在（值为undefined）
     *
     * @template T
     * @param {T} decl
     * @returns {InstanceType<T>}
     * @memberof SappSDK
     */
    getServiceUnsafe<T extends typeof ServService>(decl: T): InstanceType<T>;
    getServiceUnsafe<M extends {
        [key: string]: typeof ServService;
    }>(decls: M): {
        [key in keyof M]: InstanceType<M[key]>;
    };
    /**
     * 根据服务声明获取服务对象，返回一个Promise；如果某个服务不存在，Promise将reject。
     *
     * @template T
     * @param {T} decl
     * @returns {Promise<InstanceType<T>>}
     * @memberof SappSDK
     */
    service<T extends typeof ServService>(decl: T): Promise<InstanceType<T>>;
    service<M extends {
        [key: string]: typeof ServService;
    }>(decls: M): Promise<{
        [key in keyof M]: InstanceType<M[key]>;
    }>;
    /**
     * 根据服务声明获取服务对象，通过回调方式接收服务对象；如果某个服务不存在，回调得不到调用。
     *
     * @template T
     * @template R
     * @param {T} decl
     * @param {((service: InstanceType<T>) => R)} exec
     * @memberof SappSDK
     */
    serviceExec<T extends typeof ServService, R>(decl: T, exec: ((service: InstanceType<T>) => R)): any;
    serviceExec<M extends {
        [key: string]: typeof ServService;
    }, R>(decls: M, exec: ((services: {
        [key in keyof M]: InstanceType<M[key]>;
    }) => R)): any;
    protected beforeStart(options: SappSDKStartOptions): Promise<void>;
    protected afterStart(): Promise<void>;
    protected onStartFailed(): void;
    protected resolveStartParams(options: SappSDKStartOptions): Promise<SappSDKStartParams>;
    protected beforeInitTerminal(): Promise<void>;
    protected initTerminal(options: SappSDKStartOptions, params: SappSDKStartParams): Promise<void>;
    protected afterInitTerminal(): Promise<void>;
    protected initSDK(): Promise<void>;
    protected onCreate(params: SappSDKStartParams, data: any): Promise<void>;
    protected onShow(params: SappShowParams): Promise<boolean>;
    protected onHide(params: SappHideParams): Promise<boolean>;
    protected onClose(): Promise<void>;
}
export declare const sappSDK: SappSDK;
