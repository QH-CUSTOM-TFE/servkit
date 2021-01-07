import { ServSession, ServSessionPackage } from '../ServSession';
export declare enum EServChannel {
    WINDOW = 1,
    MESSAGE = 2,
    EVENT = 3,
    EVENT_LOADER = 4
}
export interface ServChannelConfig {
    ignoreSenderType?: boolean;
}
export interface ServChannelOpenOptions {
}
export interface ServChannelObjectPackage {
    __mark__: string;
    data: ServSessionPackage;
}
export declare type ServChannelPackage = string | ServChannelObjectPackage;
export declare abstract class ServChannel {
    protected session: ServSession;
    protected config: ServChannelConfig;
    protected sendMark: string;
    protected recvMark: string;
    protected recvable: boolean;
    protected sendable: boolean;
    protected sendStringMark: string;
    protected recvStringMark: string;
    init(session: ServSession, config?: ServChannelConfig): void;
    release(): void;
    isRecvable(): boolean;
    isSendable(): boolean;
    isOpened(): boolean;
    send(msg: ServSessionPackage): boolean;
    abstract open(options?: ServChannelOpenOptions): Promise<void>;
    abstract close(): void;
    protected toObjectPackage(data: ServSessionPackage): ServChannelObjectPackage;
    protected toStringPackage(data: ServSessionPackage): string;
    protected frObjectPackage(data: ServChannelObjectPackage): ServSessionPackage | undefined;
    protected frStringPackage(data: string): ServSessionPackage | undefined;
    protected frChannelPackage(rawData: ServChannelPackage): ServSessionPackage | undefined;
    protected abstract sendChannelPackage(msg: ServChannelPackage): boolean;
    protected canRecvChannelPackage(msg: ServChannelPackage): boolean;
    protected recvChannelPackage(msg: ServChannelPackage): void;
}
