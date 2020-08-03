import { ServSession } from '../session/ServSession';
export interface ConstructorOf<T> {
    new (...args: any[]): T;
}
export declare const Env: {
    DEV: boolean;
};
export declare enum EServConstant {
    SERV_API_TIMEOUT = 30000,
    SERV_SESSION_OPEN_TIMEOUT = 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT = 30000
}
export declare const asyncThrow: (error: any) => void;
export declare const noop: () => {};
export declare const logSession: (session: ServSession, ...args: any[]) => void;
