import { ServSession } from '../session/ServSession';
import { ServServiceServer } from '../service/ServServiceServer';
export declare const Env: {
    DEV: boolean;
    JEST: boolean;
    SAPPSDK_MOCK: boolean;
};
export declare const EServConstant: {
    SERV_SAPP_ON_START_TIMEOUT: number;
    SERV_COMMON_RETURN_TIMEOUT: number;
    SERV_API_TIMEOUT: number;
    SERV_SESSION_OPEN_TIMEOUT: number;
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: number;
    SAPP_HIDE_MAX_TIME: number;
    SAPP_LIFECYCLE_TIMEOUT: number;
};
export declare function setServConstant(constans: Partial<typeof EServConstant>): void;
declare function logSessionImpl(session: ServSession, ...args: any[]): void;
declare function logServerACLImpl(server: ServServiceServer, ...args: any[]): void;
export declare let logSession: typeof logSessionImpl;
export declare let logACL: typeof logServerACLImpl;
export declare const setEnv: (env: Partial<typeof Env>) => void;
export declare function noop(): void;
export declare function asyncThrow(error: any): void;
export declare function asyncThrowMessage(msg: string): void;
export declare function nextUUID(): string;
export declare function safeExec<T extends (...args: any) => any>(func: T): ReturnType<T>;
export {};
