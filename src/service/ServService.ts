import { asyncThrowMessage, asyncThrow } from '../common/common';

export type ServACL = any;
export type ServEXT = any;

export interface ServDeclOptions {
    id: string;
    version: string;
    ACL?: ServACL;
    EXT?: ServEXT;
}

// tslint:disable-next-line:no-empty-interface
export interface ServImplOptions {
    //
}

export interface ServAPIOptions {
    timeout?: number;
    dontRetn?: boolean;
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

export interface ServNotifyOptions {
    onCallTransform?: {
        send: (args: any) => any;
        recv: (rawArgs: any) => any;
    };
    ACL?: ServACL;
    EXT?: ServEXT;
}

export interface ServEventerOptions {
    ACL?: ServACL;
    EXT?: ServEXT;
}

const DEFAULT_SERV_API_OPTIONS: ServAPIOptions = {};
const DEFAULT_NOTIFY_API_OPTIONS: ServAPIOptions = { dontRetn: true };
const DEFAULT_SERV_EVENTER_OPTIONS: ServEventerOptions = {};

export interface ServAPICallOptions {
    timeout?: number;
}

export interface ServAPI<A, R = void> {
    (args: A, options?: ServAPICallOptions): Promise<R>;
}

export type ServAPIArgs<A = void> = A;
export type ServAPIRetn<R = void> = Promise<R>;
export const API_UNSUPPORT = () => Promise.reject(new Error('unsupport'));
export const API_ERROR = (error?: any) => Promise.reject(error || new Error('unknown'));

export function API_SUCCEED(): Promise<any>;
export function API_SUCCEED<T>(data: Promise<T>): Promise<T>;
export function API_SUCCEED<T>(data: T): Promise<T>;
export function API_SUCCEED(data?: any) { 
    return Promise.resolve(data);
}

export type ServEventListener<A = any> = (args: A) => void;
export type ServEventUnListener = () => void;

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

export class ServService {
    meta() {
        return meta(this);
    }

    static meta() {
        return meta(this);
    }
}

(ServService as any).IS_SERV_SERVICE = true;
(ServService.prototype as any).IS_SERV_SERVICE = true;

const META = '__serv_service_meta';

export interface ServAnnoDecl {
    (options: ServDeclOptions): ((cls: typeof ServService) => void);
    api: typeof api;
    notify: typeof notify;
    event: typeof event;
}

export interface ServAnnoImpl {
    (options?: ServImplOptions): ((cls: typeof ServService) => void);
    inject: typeof implInject;
}

const decl: ServAnnoDecl = ((options: ServDeclOptions) => {
    return function(cls: typeof ServService) {
        try {
            if (!(cls as any).IS_SERV_SERVICE) {
                asyncThrowMessage(`The Service should extends from ServService.`);
                return;
            }
            const metas = meta(cls, true);
            if (!metas) {
                asyncThrowMessage(`Invalid Service class.`);
                return;
            }

            if (!options.id) {
                throw new Error('[SERVKIT] id is empty in service declaration');
            }

            if (!options.version) {
                throw new Error(`[SERVKIT] version is empty in ${options.id} service declaration`);
            }

            metas.id = options.id;
            metas.version = options.version;
            metas.ACL = options.ACL;
            metas.EXT = options.EXT;

        } catch (e) {
            asyncThrow(e);
        }
    };
}) as any;

const impl: ServAnnoImpl = ((options?: ServImplOptions) => {
    return function(cls: any) {
        try {
            if (!(cls as any).IS_SERV_SERVICE) {
                asyncThrowMessage(`The Service should extends from ServService.`);
                return;
            }

            const metas = meta(cls);
            if (!metas) {
                asyncThrowMessage(`Invalid Service class.`);
                return;
            }
            const proto = cls.prototype;
            metas.apis.forEach((item) => {
                if (!proto.hasOwnProperty(item.name)) {
                    asyncThrowMessage(`The service impl forget to implement api [${item.name}].`);
                }
            });
        } catch (e) {
            asyncThrow(e);
        }
    };
}) as any;

function api(options?: ServAPIOptions) {
    return function(proto: any, propKey: string) {
        try {
            const metas = meta(proto, true);
            if (!metas) {
                asyncThrowMessage(`Can't get meta in api [${propKey}].`);
                return;
            }
    
            const apis = metas.apis;
            for (let i = 0, iz = apis.length; i < iz; ++i) {
                if (apis[i].name === propKey) {
                    asyncThrowMessage(`Api conflicts [${propKey}].`);
                    return;
                }
            }

            const item: ServAPIMeta = {
                name: propKey,
                options: DEFAULT_SERV_API_OPTIONS,
            };

            if (options) {
                item.options = options;
            }
    
            apis.push(item);
        } catch (e) {
            asyncThrow(e);
        }
    };
}

function notify(options?: ServNotifyOptions) {
    return function(proto: any, propKey: string) {
        try {
            const metas = meta(proto, true);
            if (!metas) {
                asyncThrowMessage(`Can't get meta in api [${propKey}].`);
                return;
            }
    
            const apis = metas.apis;
            for (let i = 0, iz = apis.length; i < iz; ++i) {
                if (apis[i].name === propKey) {
                    asyncThrowMessage(`Api conflicts [${propKey}].`);
                    return;
                }
            }

            const item: ServAPIMeta = {
                name: propKey,
                options: DEFAULT_NOTIFY_API_OPTIONS,
            };

            if (options) {
                item.options = options;
                item.options.dontRetn = true;
            }
    
            apis.push(item);
        } catch (e) {
            asyncThrow(e);
        }
    };
}

function event(options?: ServEventerOptions) {
    return function(proto: any, propKey: string) {
        try {
            const metas = meta(proto, true);
            if (!metas) {
                asyncThrowMessage(`Can't get meta in event [${propKey}].`);
                return;
            }
    
            const events = metas.evts;
            for (let i = 0, iz = events.length; i < iz; ++i) {
                if (events[i].name === propKey) {
                    asyncThrowMessage(`Event conflicts [${propKey}].`);
                    return;
                }
            }

            const item: ServEventerMeta = {
                name: propKey,
                options: DEFAULT_SERV_EVENTER_OPTIONS,
            };

            if (options) {
                item.options = options;
            }
    
            events.push(item);
        } catch (e) {
            asyncThrow(e);
        }
    };
}

function meta(obj: typeof ServService | ServService, create?: boolean): ServServiceMeta | undefined {
    try {
        let ret = (obj as any)[META] as ServServiceMeta;
        if (ret) {
            return ret;
        }

        if (typeof obj === 'function') {
            ret = (obj.prototype as any)[META];
            if (!ret && create) {
                ret = {
                    id: '',
                    version: '',
                    apis: [],
                    evts: [],
                };

                (obj.prototype as any)[META] = ret;
            }

            return ret;
        } else if (create && typeof obj === 'object' && (obj as any).IS_SERV_SERVICE) {
            // Prototype of Interface
            ret = {
                id: '',
                version: '',
                apis: [],
                evts: [],
            };

            (obj as any)[META] = ret;

            return ret;
        }

        asyncThrowMessage('Get meta from an invalid serv target!');
    } catch (e) {
        asyncThrow(e);
    }
}

const IMPL = '__serv_service_impl_meta';

function implMeta(obj: typeof ServService | ServService, create?: boolean): ServServiceImplMeta | undefined {
    try {
        let ret = (obj as any)[IMPL] as ServServiceImplMeta;
        if (ret) {
            return ret;
        }

        if (typeof obj === 'function') {
            ret = (obj.prototype as any)[IMPL];
            if (!ret && create) {
                ret = {
                    injects: {},
                };

                (obj.prototype as any)[IMPL] = ret;
            }

            return ret;
        } else if (create && typeof obj === 'object' && (obj as any).IS_SERV_SERVICE) {
            // Prototype of Interface
            ret = {
                injects: {},
            };

            (obj as any)[IMPL] = ret;

            return ret;
        }

        asyncThrowMessage('Get meta from an invalid impl target!');
    } catch (e) {
        asyncThrow(e);
    }
}

export enum EServImplInject {
    NULL = 0,
    GET_SERVICE,
}

export interface ServImplInject {
    type: EServImplInject;
    name: string;
}

export interface ServServiceImplMeta {
    injects: { [key: string]: ServImplInject };
}

export type ServImplGetService = (decl: typeof ServService) => ServService;

function implInject(type: EServImplInject) {
    return function(proto: any, propKey: string) {
        try {
            const metas = implMeta(proto, true);
            if (!metas) {
                asyncThrowMessage(`Can't get impl metas in inject [${propKey}].`);
                return;
            }

            metas.injects[type] = {
                type,
                name: propKey,
            };
        } catch (e) {
            asyncThrow(e);
        }
    };
}

decl.api = api;
decl.event = event;
decl.notify = notify;

impl.inject = implInject;

export const anno = {
    decl,
    impl,
};

export const util = {
    implMeta,
};
