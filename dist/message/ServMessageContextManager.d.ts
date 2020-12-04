export declare class ServContextedMessage {
    $id: string;
}
export interface ServMessageAddOptions {
    timeout?: number;
    prewait?: Promise<any>;
    ctxData?: any;
}
export declare class ServMessageContextManager {
    private contexts;
    init(): void;
    release(): void;
    add(message: ServContextedMessage, options?: ServMessageAddOptions): Promise<any> | undefined;
    has(id: string): boolean;
    get(id: string): ServContextedMessage | undefined;
    getPromise(id: string): Promise<any> | undefined;
    getCtxData<T = any>(id: string): T;
    succeed(id: string, data?: any): boolean;
    failed(id: string, error?: any): boolean;
    timeout(id: string, error?: any): boolean;
    protected clean(id: string): boolean;
}
