export declare type ServACL = any;
export declare type ServEXT = any;
export interface ServDeclOptions {
    id: string;
    version: string;
    ACL?: ServACL;
    EXT?: ServEXT;
}
export interface ServImplOptions {
}
export interface ServAPIOptions {
    timeout?: number;
    onCallTransform?: {
        send: (args: any) => any;
        recv: (rawArgs: any) => any;
    };
    onRetnTransform?: {
        send: (data: any) => any;
        recv: (rawData: any) => any;
    };
    ACL?: ServACL;
    EXT?: ServEXT;
}
export interface ServEventerOptions {
    ACL?: ServACL;
    EXT?: ServEXT;
}
export interface ServAPICallOptions {
    timeout?: number;
}
export interface ServAPI<A, R = void> {
    (args: A, options?: ServAPICallOptions): Promise<R>;
}
export declare type ServAPIArgs<A = void> = A;
export declare type ServAPIRetn<R = void> = Promise<R>;
export declare const API_UNSUPPORT: () => Promise<never>;
export declare const API_ERROR: (error?: any) => Promise<never>;
export declare function API_SUCCEED(): Promise<any>;
export declare function API_SUCCEED<T>(data: Promise<T>): Promise<T>;
export declare function API_SUCCEED<T>(data: T): Promise<T>;
export declare type ServEventListener<A = any> = (args: A) => void;
export declare type ServEventUnListener = () => void;
export interface ServEventer<A = void> {
    on(listener: ServEventListener<A>): ServEventUnListener;
    once(listener: ServEventListener<A>): ServEventUnListener;
    emit(args: A): void;
}
export interface ServAPIMeta {
    name: string;
    options: ServAPIOptions;
}
export interface ServEventerMeta {
    name: string;
    options: ServEventerOptions;
}
export interface ServServiceMeta {
    id: string;
    version: string;
    ACL?: ServACL;
    EXT?: ServEXT;
    apis: ServAPIMeta[];
    evts: ServEventerMeta[];
}
export declare class ServService {
    meta(): ServServiceMeta | undefined;
    static meta(): ServServiceMeta | undefined;
}
export interface ServAnnoDecl {
    (options: ServDeclOptions): ((cls: typeof ServService) => void);
    api: typeof api;
    event: typeof event;
}
export interface ServAnnoImpl {
    (options?: ServImplOptions): ((cls: typeof ServService) => void);
    inject: typeof implInject;
}
declare function api(options?: ServAPIOptions): (proto: any, propKey: string) => void;
declare function event(options?: ServEventerOptions): (proto: any, propKey: string) => void;
declare function implMeta(obj: typeof ServService | ServService, create?: boolean): ServServiceImplMeta | undefined;
export declare enum EServImplInject {
    NULL = 0,
    GET_SERVICE = 1
}
export interface ServImplInject {
    type: EServImplInject;
    name: string;
}
export interface ServServiceImplMeta {
    injects: {
        [key: string]: ServImplInject;
    };
}
export declare type ServImplGetService = (decl: typeof ServService) => ServService;
declare function implInject(type: EServImplInject): (proto: any, propKey: string) => void;
export declare const anno: {
    decl: ServAnnoDecl;
    impl: ServAnnoImpl;
};
export declare const util: {
    implMeta: typeof implMeta;
};
export {};
