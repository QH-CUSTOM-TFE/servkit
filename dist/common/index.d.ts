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
export declare function generateQueryParams(params: any): string;
export declare function parseQueryParams(): any;
export interface Deferred<T = void> extends Promise<T> {
    reject(error?: any): void;
    resolve(): void;
    resolve(data: T): void;
}
export declare function createDeferred<T = void>(): Deferred<T>;
export declare const EServConstant: {
    SERV_COMMON_RETURN_TIMEOUT: number;
    SERV_API_TIMEOUT: number;
    SERV_SESSION_OPEN_TIMEOUT: number;
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: number;
};
export declare function setServConstant(constans: Partial<typeof EServConstant>): void;
export {};
