export declare enum EDeferredResult {
    NONE = 0,
    RESOLVED = 1,
    REJECTED = 2,
    TIMEOUT = 3
}
export interface DeferredOptions {
    timeout?: number;
    rejectIf?: Promise<void>;
    resolveIf?: Promise<void>;
}
export interface Deferred<T = void> extends Promise<T> {
    reject(error?: any): void;
    resolve(): void;
    resolve(data: T): void;
    isFinished(): EDeferredResult;
}
export declare class DeferredUtil {
    static create<T = void>(options?: DeferredOptions): Deferred<T>;
    static resolve<T = void>(data?: any): Deferred<T>;
    static reject<T = void>(error?: any): Deferred<T>;
    static reEntryGuard<T extends Function>(func: T, options?: DeferredOptions): T & {
        deferred: Deferred | undefined;
    };
}
