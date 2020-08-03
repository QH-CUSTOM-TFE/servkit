export interface ServDeclOptions {
    id: string;
    version: string;
}
export interface ServImplOptions {
}
export interface ServAPIOptions {
    timeout?: number;
}
export interface ServAPI<A, R = void> {
    (args: A, options?: ServAPIOptions): Promise<R>;
}
export declare type ServAPIArgs<A = void> = A;
export declare type ServAPIRetn<R = void> = Promise<R>;
export declare const API_UNSUPPORT: () => Promise<never>;
export declare const API_ERROR: (error?: any) => Promise<never>;
export declare const API_SUCCEED: (data?: any) => Promise<any>;
export declare type ServEventListener<A = any> = (args: A) => void;
export declare type ServEventUnListener = () => void;
export interface ServEventer<A = void> {
    on(listener: ServEventListener<A>): ServEventUnListener;
    once(listener: ServEventListener<A>): ServEventUnListener;
    emit(args: A): void;
}
export interface ServAPIMeta {
    name: string;
}
export interface ServEventerMeta {
    name: string;
}
export interface ServServiceMeta {
    id: string;
    version: string;
    apis: ServAPIMeta[];
    evts: ServEventerMeta[];
}
export declare class ServService {
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
declare function apiDecorate(proto: any, propKey: string): void;
declare function api(): typeof apiDecorate;
declare function eventDecorate(proto: any, propKey: string): void;
declare function event(): typeof eventDecorate;
declare function meta(obj: typeof ServService | ServService, create?: boolean): ServServiceMeta | undefined;
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
    meta: typeof meta;
    implMeta: typeof implMeta;
};
export {};
