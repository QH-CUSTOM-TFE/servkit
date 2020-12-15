import { ServEventerManager } from './event/ServEventerManager';
import { ServService, ServServiceMeta } from './ServService';
interface ServServiceInfo {
    meta: ServServiceMeta;
    decl: typeof ServService;
    impl: typeof ServService;
}
export interface ServServiceOptions {
    lazy?: boolean;
}
export declare type ServServiceReferPattern = RegExp | string | ((service: string) => boolean) | Array<RegExp | string | ((service: string) => boolean)>;
export declare type ServServiceOnEmitListener = (service: string, event: string, args: any) => void;
export declare class ServServiceRefer {
    protected pattern: ServServiceReferPattern;
    protected manager: ServServiceManager;
    onEvnterEmit?: ServServiceOnEmitListener;
    constructor(manager: ServServiceManager, pattern: ServServiceReferPattern);
    canRefer(service: string): boolean;
    getServiceByID<T extends ServService>(id: string): T | undefined;
    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    rawEmit(service: string, event: string, args: any): void;
    setPattern(pattern: ServServiceReferPattern): void;
    detach(): void;
    _onEventerEmit(service: string, event: string, args: any): void;
}
export interface ServServiceConfig {
    services?: Array<{
        decl: typeof ServService;
        impl: typeof ServService;
        options?: ServServiceOptions;
    }>;
}
export declare class ServServiceManager {
    protected eventerManager: ServEventerManager;
    protected services: {
        [key: string]: ServService;
    };
    protected serviceInfos: {
        [key: string]: ServServiceInfo;
    };
    protected refers: ServServiceRefer[];
    onEvnterEmit?: ServServiceOnEmitListener;
    init(config?: ServServiceConfig): void;
    release(): void;
    getServiceByID<T extends ServService>(id: string): T | undefined;
    protected _getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    getService<M extends {
        [key: string]: typeof ServService;
    }>(decls: M): {
        [key in keyof M]: InstanceType<M[key]> | undefined;
    };
    getServiceUnsafe<T extends typeof ServService>(decl: T): InstanceType<T>;
    getServiceUnsafe<M extends {
        [key: string]: typeof ServService;
    }>(decls: M): {
        [key in keyof M]: InstanceType<M[key]>;
    };
    service<T extends typeof ServService>(decl: T): Promise<InstanceType<T>>;
    service<M extends {
        [key: string]: typeof ServService;
    }>(decls: M): Promise<{
        [key in keyof M]: InstanceType<M[key]>;
    }>;
    serviceExec<T extends typeof ServService, R>(decl: T, exec: ((service: InstanceType<T>) => R)): any;
    serviceExec<M extends {
        [key: string]: typeof ServService;
    }, R>(decls: M, exec: ((services: {
        [key in keyof M]: InstanceType<M[key]>;
    }) => R)): any;
    serviceExecByID<T extends ServService, R>(id: string, exec: ((service: T) => R)): R | null;
    addService<D extends typeof ServService, I extends D>(decl: D, impl: I, options?: ServServiceOptions): boolean;
    addServices(items: Array<{
        decl: typeof ServService;
        impl: typeof ServService;
        options?: ServServiceOptions;
    }>, options?: ServServiceOptions): void;
    remService(decl: typeof ServService): boolean;
    remServices(decls: Array<typeof ServService>): void;
    referServices(pattern: ServServiceReferPattern): ServServiceRefer;
    rawEmit(service: string, event: string, args: any): void;
    private generateService;
    private injGetService;
    private generateServiceEvent;
    private _onEventerEmit;
    onReferAttach(refer: ServServiceRefer): void;
    onReferDetach(refer: ServServiceRefer): void;
}
export {};
