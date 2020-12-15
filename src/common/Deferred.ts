export enum EDeferredResult {
    NONE = 0,
    RESOLVED,
    REJECTED,
    TIMEOUT,
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

class DeferredImpl<T> {
    protected _resolve: ((data?: T | PromiseLike<T>) => void);
    protected _reject: ((error?: any) => void);
    protected _timeoutTimer: any;
    protected _finishedResult: EDeferredResult;

    deferred: Deferred<T>;

    constructor(options?: DeferredOptions) {
        this.createDeferred(new Promise<T>((res, rej) => {
            this._resolve = res;
            this._reject = rej;
        }));

        if (options && options.timeout && options.timeout > 0) {
            this.startTimeout(options.timeout);
        }

        if (options && options.rejectIf) {
            options.rejectIf.catch((error) => {
                this.reject(error);
            });
        }

        if (options && options.resolveIf) {
            options.resolveIf.then(() => {
                this.resolve();
            }, (error) => {
                this.reject(error);
            });
        }
    }

    resolve = (data?: T | PromiseLike<T>) => {
        this.clearTimeout();

        if (this.isFinished()) {
            return;
        }

        this._finishedResult = EDeferredResult.RESOLVED;
        return this._resolve(data);
    }

    reject = (error?: any) => {
        this.clearTimeout();

        if (this.isFinished()) {
            return;
        }

        this._finishedResult = EDeferredResult.REJECTED;
        return this._reject(error);
    }

    timeout = () => {
        this._timeoutTimer = 0;

        if (this.isFinished()) {
            return;
        }

        this._finishedResult = EDeferredResult.TIMEOUT;
        this._reject(new Error('timeout'));
    }

    isFinished = () => {
        return this._finishedResult;
    }

    protected startTimeout(timeout: number) {
        this.clearTimeout();

        this._timeoutTimer = setTimeout(() => {
            this.timeout();
        }, timeout);
    }

    protected clearTimeout() {
        if (this._timeoutTimer) {
            clearTimeout(this._timeoutTimer);
            this._timeoutTimer = 0;
        }
    }

    protected createDeferred(promise: Promise<T>) {
        const deferred = promise as Deferred<T>;
        deferred.resolve = this.resolve;
        deferred.reject = this.reject;
        deferred.isFinished = this.isFinished; 

        this.deferred = deferred;
    }
}

export class DeferredUtil {
    static create<T = void>(options?: DeferredOptions) {
        const impl = new DeferredImpl<T>(options);
        return impl.deferred;
    }
    static resolve<T = void>(data?: any): Deferred<T> {
        const ret = DeferredUtil.create<T>();
        ret.resolve(data);

        return ret;
    }

    static reject<T = void>(error?: any): Deferred<T> {
        const ret = DeferredUtil.create<T>();
        ret.reject(error);

        return ret;
    }

    static reEntryGuard<T extends Function>(func: T, options?: DeferredOptions) {
        const newFunc = function() {
            if (newFunc.deferred) {
                return newFunc.deferred;
            }
    
            const deferred = DeferredUtil.create<T>(options);
            newFunc.deferred = deferred;
            deferred.then(() => {
                newFunc.deferred = undefined;
            }, () => {
                newFunc.deferred = undefined;
            });

            try {
                Promise.resolve(func.apply(this, arguments)).then((val) => {
                    deferred.resolve(val);
                }, (err) => {
                    deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(e);
            }
    
            return deferred;
        } as any;
    
        return newFunc as T & { deferred: Deferred | undefined };
    }

}
