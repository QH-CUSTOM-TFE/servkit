import { ServMessageContextManager } from '../message/ServMessageContextManager';
import { ServMessage, ServSessionCallReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { EServChannel, ServChannel, ServChannelConfig } from './channel/ServChannel';
import { ServEventChannelConfig } from './channel/ServEventChannel';
import { ServMessageChannelConfig } from './channel/ServMessageChannel';
import { ServWindowChannelConfig } from './channel/ServWindowChannel';
import { ServSessionChecker, ServSessionCheckerStartOptions } from './ServSessionChecker';
export declare enum EServSessionStatus {
    CLOSED = 0,
    OPENNING = 1,
    OPENED = 2
}
export interface ServSessionCallOptions {
    timeout?: number;
}
export interface ServSessionConfig {
    checkSession?: boolean;
    checkOptions?: ServSessionCheckerStartOptions;
    channel: {
        type: EServChannel | typeof ServChannel;
        config?: ServChannelConfig | ServWindowChannelConfig | ServMessageChannelConfig | ServEventChannelConfig;
    };
}
export interface ServSessionOpenOptions {
    timeout?: number;
}
export declare type ServSessionPackage = ServMessage;
export interface ServSessionListener {
    onRecvData<T>(data: any): boolean;
}
export declare type ServSessionOnRecvMessageListener = (message: ServMessage, session: ServSession, terminal: ServTerminal) => boolean;
export declare type ServSessionOnRecvCallMessageListener = (type: string, args: any, doReturn: ((data?: any, error?: any) => void), session: ServSession, terminal: ServTerminal) => boolean;
export declare class ServSession {
    protected terminal: ServTerminal;
    protected status: EServSessionStatus;
    protected openningPromise?: Promise<void>;
    protected openningCancel?: (() => void);
    protected channel: ServChannel;
    protected onRecvListeners: ServSessionOnRecvMessageListener[];
    protected onRecvCallListeners: ServSessionOnRecvCallMessageListener[];
    protected messageContextManager: ServMessageContextManager;
    protected sessionChecker?: ServSessionChecker;
    protected sessionCheckOptions?: ServSessionCheckerStartOptions;
    constructor(terminal: ServTerminal);
    init(config: ServSessionConfig): void;
    release(): void;
    protected initChannel(config: ServSessionConfig['channel']): void;
    protected releaseChannel(): void;
    isMaster(): boolean;
    getID(): string;
    isOpened(): boolean;
    open(options?: ServSessionOpenOptions): Promise<void>;
    close(): void;
    sendMessage(msg: ServMessage): Promise<void>;
    callMessage<T = any>(type: string, args?: any, options?: ServSessionCallOptions): Promise<T>;
    protected handleReturnMessage(message: ServSessionCallReturnMessage): boolean;
    recvPackage(pkg: ServSessionPackage): void;
    protected dispatchMessage(msg: ServMessage): void;
    onRecvMessage(listener: ServSessionOnRecvMessageListener): () => void;
    onRecvCallMessage(listener: ServSessionOnRecvCallMessageListener): () => void;
}
