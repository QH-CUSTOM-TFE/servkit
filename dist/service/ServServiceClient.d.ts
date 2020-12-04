import { ServMessageContextManager } from '../message/ServMessageContextManager';
import { ServMessage, ServServiceEventMessage, ServServiceMessage, ServServiceReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { ServEventerManager } from './event/ServEventerManager';
import { ServServiceMeta, ServService } from './ServService';
export interface ServServiceClientConfig {
}
export declare class ServServiceClient {
    protected messageContextManager: ServMessageContextManager;
    protected eventerManager: ServEventerManager;
    protected services: {
        [key: string]: ServService;
    };
    protected terminal: ServTerminal;
    protected sessionUnlisten?: (() => void);
    constructor(terminal: ServTerminal);
    init(config?: ServServiceClientConfig): void;
    release(): void;
    private _getService;
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
    protected checkServiceVersion(service: ServServiceMeta): void;
    private generateService;
    private generateServiceAPI;
    private generateServiceEvent;
    private sendMessage;
    protected onRecvMessage: (message: ServMessage) => boolean;
    protected handleAPIReturnMessage(message: ServServiceReturnMessage, origin: ServServiceMessage): boolean;
    protected sendCommonMessageForReturn(message: ServServiceMessage, timeout?: number): Promise<any>;
    protected handleCommonMessageReturn(message: ServServiceReturnMessage, origin: ServServiceMessage): boolean;
    protected handleEventMessage(message: ServServiceEventMessage): boolean;
}
