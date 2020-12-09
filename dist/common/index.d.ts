import { ServSession } from '../session/ServSession';
import { ServServiceServer } from '../service/ServServiceServer';
export interface ConstructorOf<T> {
    new (...args: any[]): T;
}
export declare const Env: {
    DEV: boolean;
    JEST: boolean;
};
export declare function asyncThrow(error: any): void;
export declare function asyncThrowMessage(msg: string): void;
export declare function noop(): void;
declare function logSessionImpl(session: ServSession, ...args: any[]): void;
declare function logServerACLImpl(server: ServServiceServer, ...args: any[]): void;
export declare let logSession: typeof logSessionImpl;
export declare let logACL: typeof logServerACLImpl;
export declare const setEnv: (env: Partial<typeof Env>) => void;
export declare function wrapServQueryParams(url: string, params: any): string;
export declare function generateServQueryParams(params: any): string;
export declare function parseServQueryParams(): any;
export declare function aspect<O = any>(obj: O, fn: string, beforeImpl?: () => void, afterImpl?: (result?: any) => any): void;
export declare function aspectBefore<O = any>(obj: O, fn: string, impl: () => void): void;
export declare function aspectAfter<O = any>(obj: O, fn: string, impl: (result: any) => any): void;
export declare function nextUUID(): string;
export declare const EServConstant: {
    SERV_APP_SHOW_HIDE_TIMEOUT: number;
    SERV_SAPP_ON_START_TIMEOUT: number;
    SERV_COMMON_RETURN_TIMEOUT: number;
    SERV_API_TIMEOUT: number;
    SERV_SESSION_OPEN_TIMEOUT: number;
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: number;
    SAPP_HIDE_MAX_TIME: number;
};
export declare function setServConstant(constans: Partial<typeof EServConstant>): void;
export {};
