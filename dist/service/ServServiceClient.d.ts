import { ConstructorOf } from '../common/index';
import { ServMessageContextManager } from '../message/ServMessageContextManager';
import { ServMessage, ServServiceEventMessage, ServServiceMessage, ServServiceReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { ServEventerManager } from './event/ServEventerManager';
import { ServService } from './ServService';
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
    init(confit?: ServServiceClientConfig): void;
    release(): void;
    getService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined;
    serviceExec<T extends ConstructorOf<any>, R>(decl: T, exec: ((service: InstanceType<T>) => R)): R | null;
    private generateService;
    private generateServiceAPI;
    private generateServiceEvent;
    private sendMessage;
    protected onRecvMessage: (message: ServMessage) => boolean;
    protected handleAPIReturnMessage(message: ServServiceReturnMessage, origin: ServServiceMessage): boolean;
    protected handleEventMessage(message: ServServiceEventMessage): boolean;
}
