import { Deferred, DeferredUtil } from './Deferred';
export type AsyncMutexUnlock = () => void;

export interface AsyncMutexLock {
    deferred: Deferred<AsyncMutexUnlock>;
    unlock: AsyncMutexUnlock;
}

export interface AsyncMutexOptions {
    max?: number;
}

export class AsyncMutex {
    protected lockQueue: AsyncMutexLock[];
    protected lockMax: number;

    constructor(options?: AsyncMutexOptions) {
        this.lockMax = Math.min((options && options.max) || 1, 1);
        this.lockQueue = [];
    }

    lock(): Promise<AsyncMutexUnlock> {
        const lock = {
            deferred: DeferredUtil.create<AsyncMutexUnlock>(),
            unlock: () => {
                const i = this.lockQueue.indexOf(lock);
                if (i >= 0) {
                    this.lockQueue.splice(i, 1);
                }
                this.tryLock();
            },
        };

        this.lockQueue.push(lock);

        this.tryLock();

        return lock.deferred;
    }

    lockGuard<T extends Function>(func: T): T {
        const self = this;
        const newFunc = function() {
            const args = Array.prototype.slice.apply(arguments);
            return self.lock().then((unlock) => {
                let ret: any;
                try {
                    ret = func.apply(this, args);
                } catch (e) {
                    ret = Promise.reject(e);
                }
                unlock();

                return ret;
            });
        };

        return newFunc as any;
    }

    protected tryLock() {
        if (this.lockMax === 1) {
            const lock = this.lockQueue[0];
            if (lock && !lock.deferred.isFinished()) {
                lock.deferred.resolve(lock.unlock);
            }
        } else {
            for (let i = 0, iz = this.lockMax; i < iz; ++i) {
                const lock = this.lockQueue[i];
                if (lock && !lock.deferred.isFinished()) {
                    lock.deferred.resolve(lock.unlock);
                }
            }
        }
    }
}
