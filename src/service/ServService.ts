import { asyncThrowMessage, asyncThrow } from '../common/index';
export interface ServDeclOptions {
    id: string;
    version: string;
}

// tslint:disable-next-line:no-empty-interface
export interface ServImplOptions {
    //
}

export interface ServAPIOptions {
    timeout?: number;
}

export interface ServAPI<A, R = void> {
    (args: A, options?: ServAPIOptions): Promise<R>;
}

export type ServAPIArgs<A = void> = A;
export type ServAPIRetn<R = void> = Promise<R>;
export const API_UNSUPPORT = () => Promise.reject(new Error('unsupport'));
export const API_ERROR = (error?: any) => Promise.reject(error || 'error');
export const API_SUCCEED = (data?: any) => Promise.resolve(data);

export type ServEventListener<A = any> = (args: A) => void;
export type ServEventUnListener = () => void;

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

export class ServService {

}

(ServService as any).IS_SERV_SERVICE = true;
(ServService.prototype as any).IS_SERV_SERVICE = true;

const META = '__serv_service_meta';

export interface ServAnnoDecl {
    (options: ServDeclOptions): ((cls: typeof ServService) => void);
    api: typeof api;
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

            metas.id = options.id;
            metas.version = options.version;
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

function apiDecorate(proto: any, propKey: string) {
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

        apis.push({
            name: propKey,
        });
    } catch (e) {
        asyncThrow(e);
    }
}

function api() {
    return apiDecorate;
}

function eventDecorate(proto: any, propKey: string) {
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

        events.push({
            name: propKey,
        });
    } catch (e) {
        asyncThrow(e);
    }
}

function event() {
    return eventDecorate;
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

impl.inject = implInject;

export const anno = {
    decl,
    impl,
};

export const util = {
    meta,
    implMeta,
};
