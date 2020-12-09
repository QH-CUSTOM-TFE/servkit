import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServServiceServerConfig } from '../service/ServServiceServer';
import { ServService } from '../service/ServService';
import { ServServiceClientConfig } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { SappInfo, SappMGR } from './SappMGR';
import { Deferred } from '../common/Deferred';
import { AsyncMutex } from '../common/AsyncMutex';
import { SappController } from './SappController';
/**
 * SappSDK启动参数
 */
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
    resolveTerminalConfig?(sdk: Sapp, config: ServTerminalConfig): Promise<ServTerminalConfig> | ServTerminalConfig | void;
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
export declare class Sapp {
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
    protected mutex: AsyncMutex;
    protected showHideMutex: AsyncMutex;
    protected manager: SappMGR;
    constructor(uuid: string, info: SappInfo, manager: SappMGR);
    attachController(controller: SappController): boolean;
    detachController(): void;
    getController(): SappController | undefined;
    setConfig(config: SappConfig): this;
    getConfig(): SappConfig;
    start: ((options?: SappStartOptions | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    show(params?: SappShowParams): Promise<void>;
    hide(params?: SappHideParams): Promise<void>;
    protected _show: ((params?: SappShowParams | undefined, byCreate?: boolean | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    protected _hide: ((params?: SappHideParams | undefined, byClose?: boolean | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    close: ((result?: SappCloseResult | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
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
    protected beforeStart(options: SappStartOptions): Promise<void>;
    protected afterStart(): Promise<void>;
    protected onStartFailed(): void;
    protected resolveStartData(options: SappStartOptions): Promise<any>;
    protected beforeInitTerminal(): Promise<void>;
    protected initTerminal(options: SappStartOptions): Promise<void>;
    protected afterInitTerminal(): Promise<void>;
}
