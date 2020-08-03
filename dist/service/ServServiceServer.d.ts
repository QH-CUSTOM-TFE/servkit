import { ConstructorOf } from '../common/index';
import { ServMessage, ServServiceAPIMessage, ServServiceMessage, ServServiceReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { ServService } from './ServService';
import { ServServiceConfig, ServServiceManager, ServServiceOnEmitListener, ServServiceOptions, ServServiceRefer, ServServiceReferPattern } from './ServServiceManager';
export interface ServServiceServerConfig {
    service?: ServServiceConfig;
    serviceRefer?: ServServiceReferPattern;
}
export declare class ServServiceServer {
    protected service: ServServiceManager;
    protected serviceRefer?: ServServiceRefer;
    protected terminal: ServTerminal;
    protected sessionUnlisten?: (() => void);
    constructor(terminal: ServTerminal);
    init(config?: ServServiceServerConfig): void;
    release(): void;
    serviceExec<T extends ConstructorOf<any>, R>(decl: T, exec: ((service: InstanceType<T>) => R)): R | null;
    serviceExecByID<T extends ServService, R>(id: string, exec: ((service: T) => R)): R | null;
    getServiceByID<T extends ServService>(id: string): T | undefined;
    getService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined;
    addService<D extends typeof ServService, I extends D>(decl: D, impl: I, options?: ServServiceOptions): boolean;
    addServices(items: Array<{
        decl: typeof ServService;
        impl: typeof ServService;
        options?: ServServiceOptions;
    }>, options?: ServServiceOptions): void;
    protected onRecvMessage: (message: ServMessage) => boolean;
    protected handleAPIMessage(message: ServServiceAPIMessage): boolean;
    protected sendReturnMessage(retnPromise: Promise<any>, origin: ServServiceMessage, retnCreator: (message: ServServiceMessage, data?: any, error?: any) => ServServiceReturnMessage): void;
    protected sendMessage(message: ServMessage): Promise<void>;
    protected sendEventMessage(session: any, retnPromise: Promise<any>, origin: ServServiceMessage, retnCreator: (message: ServServiceMessage, data?: any, error?: any) => ServServiceReturnMessage): void;
    protected onEventerEmit: ServServiceOnEmitListener;
}
