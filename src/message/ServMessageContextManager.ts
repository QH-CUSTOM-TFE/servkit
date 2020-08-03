export class ServContextedMessage {
    $id: string;
}

interface MessageContext {
    message: ServContextedMessage;
    promise: Promise<any>;
    reject: (error?: any) => void;
    resolve: (data?: any) => void;
    timeout?: number;
}

export interface ServMessageAddOptions {
    timeout?: number;
    prewait?: Promise<any>;
}

export class ServMessageContextManager {
    private contexts: { [key: string]: MessageContext };

    init() {
        this.contexts = {};
    }

    release() {
        this.contexts = {};
    }

    add(message: ServContextedMessage, options?: ServMessageAddOptions): Promise<any> | undefined {
        const id = message.$id;
        let ctxt = this.contexts[id];
        if (ctxt) {
            return;
        }
        let resolve: any;
        let reject: any;
        const promise = new Promise((res, rej) => {
            resolve = (data: any) => {
                this.clean(id);
                return res(data);
            };
            reject = (error: any) => {
                this.clean(id);
                return rej(error);
            };
        });

        ctxt = {
            message,
            promise,
            reject,
            resolve,
        };

        this.contexts[message.$id] = ctxt;

        const timeout = options && options.timeout;
        if (timeout) {
            ctxt.timeout = setTimeout(() => {
                this.timeout(id);
            }, timeout) as any;
        }

        const prewait = options && options.prewait;
        if (prewait) {
            prewait.catch((error) => {
                this.failed(id, error);
            });
        }

        return ctxt.promise;
    }

    has(id: string): boolean {
        return !!this.contexts[id];
    }

    get(id: string): ServContextedMessage | undefined {
        const ctxt = this.contexts[id];

        return ctxt ? ctxt.message : undefined;
    }

    getPromise(id: string): Promise<any> | undefined {
        const ctxt = this.contexts[id];

        return ctxt ? ctxt.promise : undefined;
    }

    succeed(id: string, data?: any): boolean {
        const ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }

        ctxt.resolve(data);
        return true;
    }

    failed(id: string, error?: any): boolean {
        const ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }

        error = error || new Error('unknown');

        ctxt.reject(error);

        return true;
    }

    timeout(id: string, error?: any): boolean {
        const ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }

        error = error || new Error('timeout');

        ctxt.reject(error);

        return true;
    }

    protected clean(id: string): boolean {
        const ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }

        delete this.contexts[id];

        if (ctxt.timeout) {
            clearTimeout(ctxt.timeout);
        }

        return true;
    }
}
