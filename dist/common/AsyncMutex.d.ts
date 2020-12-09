import { Deferred } from './Deferred';
export declare type AsyncMutexUnlock = () => void;
export interface AsyncMutexLock {
    deferred: Deferred<AsyncMutexUnlock>;
    unlock: AsyncMutexUnlock;
}
export interface AsyncMutexOptions {
    max?: number;
}
export declare class AsyncMutex {
    protected lockQueue: AsyncMutexLock[];
    protected lockMax: number;
    constructor(options?: AsyncMutexOptions);
    lock(): Promise<AsyncMutexUnlock>;
    lockGuard<T extends Function>(func: T): T;
    protected tryLock(): void;
}
