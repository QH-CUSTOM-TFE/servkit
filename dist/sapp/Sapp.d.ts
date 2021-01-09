import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { ServSessionConfig } from '../session/ServSession';
import { SappShowParams, SappHideParams, SappCloseResult, SappAuthParams } from './service/m/SappLifecycle';
import { SappMGR } from './SappMGR';
import { Deferred } from '../common/Deferred';
import { AsyncMutex } from '../common/AsyncMutex';
import { SappController } from './SappController';
export declare enum ESappCreatePolicy {
    NONE = 0,
    SINGLETON = 1,
    INFINITE = 2
}
export declare enum ESappLifePolicy {
    NONE = 0,
    MANUAL = 1,
    AUTO = 2
}
export declare enum ESappType {
    IFRAME = "IFRAME",
    ASYNC_LOAD = "ASYNC_LOAD"
}
export declare class SappInfo {
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
    resolveSessionConfig?(sdk: Sapp): Promise<ServSessionConfig> | ServSessionConfig;
    resolveTerminalConfig?(sdk: Sapp, config: ServTerminalConfig): Promise<ServTerminalConfig> | ServTerminalConfig | void;
    afterStart?(sdk: Sapp): Promise<void>;
    startTimeout?: number;
    useTerminalId?: string;
}
export interface SappStartOptions {
    data?: any | SappConfig['resolveStartData'];
    showData?: any | SappConfig['resolveStartShowData'];
}
export declare class Sapp {
    static transformContentByInfo(content: string, info: SappInfo): string;
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
    protected mutex: AsyncMutex;
    protected showHideMutex: AsyncMutex;
    protected manager: SappMGR;
    constructor(uuid: string, info: SappInfo, manager: SappMGR);
    attachController(controller: SappController): boolean;
    detachController(): void;
    getController(): SappController | undefined;
    setConfig(config: SappConfig): this;
    getConfig(): SappConfig;
    getServkit(): import("..").Servkit;
    start: ((options?: SappStartOptions | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    getAppType(): ESappType;
    show(params?: SappShowParams): Promise<boolean>;
    hide(params?: SappHideParams): Promise<boolean>;
    protected _show: ((params?: SappShowParams | undefined, byCreate?: boolean | undefined) => Promise<boolean>) & {
        deferred: Deferred<void> | undefined;
    };
    protected _hide: ((params?: SappHideParams | undefined, byClose?: boolean | undefined) => Promise<boolean>) & {
        deferred: Deferred<void> | undefined;
    };
    close: ((result?: SappCloseResult | undefined) => Promise<boolean>) & {
        deferred: Deferred<void> | undefined;
    };
    getService: ServServiceClient['getService'];
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'];
    service: ServServiceClient['service'];
    serviceExec: ServServiceClient['serviceExec'];
    getServerService: ServServiceServer['getService'];
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'];
    serverService: ServServiceServer['service'];
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
    getTerminalId(): string;
}
