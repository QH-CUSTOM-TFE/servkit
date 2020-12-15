import { ServMessage, ServServiceAPIMessage, ServServiceMessage, ServServiceReturnMessage, ServServiceGetVersionReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { ServService } from './ServService';
import { ServServiceServerACLResolver } from './ServServiceServerACLResolver';
import { ServServiceConfig, ServServiceManager, ServServiceOnEmitListener, ServServiceOptions, ServServiceRefer, ServServiceReferPattern } from './ServServiceManager';
export interface ServServiceServerConfig {
    service?: ServServiceConfig;
    serviceRefer?: ServServiceReferPattern;
    ACLResolver?: ServServiceServerACLResolver;
}
export declare class ServServiceServer {
    terminal: ServTerminal;
    protected serviceManager: ServServiceManager;
    protected serviceRefer?: ServServiceRefer;
    protected ACLResolver?: ServServiceServerACLResolver;
    protected sessionUnlisten?: (() => void);
    constructor(terminal: ServTerminal);
    init(config?: ServServiceServerConfig): void;
    release(): void;
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
    getServiceByID<T extends ServService>(id: string): T | undefined;
    protected _getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    addService<D extends typeof ServService, I extends D>(decl: D, impl: I, options?: ServServiceOptions): boolean;
    addServices(items: Array<{
        decl: typeof ServService;
        impl: typeof ServService;
        options?: ServServiceOptions;
    }>, options?: ServServiceOptions): void;
    protected onRecvMessage: (message: ServMessage) => boolean;
    protected handleAPIMessage(message: ServServiceAPIMessage): boolean;
    protected handleGetVesionMessage(message: ServServiceGetVersionReturnMessage): boolean;
    protected sendReturnMessage(retnPromise: Promise<any>, origin: ServServiceMessage, retnCreator: (message: ServServiceMessage, data?: any, error?: any) => ServServiceReturnMessage): void;
    protected sendMessage(message: ServMessage): Promise<void>;
    protected onEventerEmit: ServServiceOnEmitListener;
}
