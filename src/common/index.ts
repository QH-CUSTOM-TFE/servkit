import { ServSession } from '../session/ServSession';
import { ServServiceServer } from '../service/ServServiceServer';
export interface ConstructorOf<T> {
    new(...args: any[]): T;
}

export const Env = {
    DEV: false,
    JEST: false,
};

try {
    const LOCAL_ENV = '__$$servkit';
    const __$$servkit = {
        getLocalEnv: (key?: string) => {
            try {
                const jsonData = window.localStorage.getItem(LOCAL_ENV);
                const data = jsonData ? JSON.parse(jsonData) : {};
                return key ? data[key] : data;
            } catch (e) {
                //
            }
        },
        setLocalEnv: (key: string, val: any = true) => {
            try {
                const data = __$$servkit.getLocalEnv();
                data[key] = val;
                window.localStorage.setItem(LOCAL_ENV, JSON.stringify(data));
                return data;
            } catch (e) {
                //
            }
        },
        enableDev: () => {
            __$$servkit.setLocalEnv('DEV');
        },
        disableDev: () => {
            __$$servkit.setLocalEnv('DEV', false);
        },
        Env,
    };
    const localEnv = __$$servkit.getLocalEnv();
    Object.assign(Env, localEnv);

    (window as any).__$$servkit = __$$servkit;
} catch (e) {
    //
}

export function asyncThrow(error: any) {
    if (!Env.JEST) {
        setTimeout(() => {
            throw error;
        });
    }
}

export function asyncThrowMessage(msg: string) {
    msg = `[SERVKIT] ${msg}`;
    asyncThrow(new Error(msg));
}

export function noop() {
    //
}

function logSessionImpl(session: ServSession, ...args: any[]) {
    const tag = `[SERVKIT][${session.getID()}][${session.isMaster() ? 'M' : 'S'}] `;
    let arg0 = args[0];
    if (typeof arg0 === 'string') {
        arg0 = tag + arg0;
        args[0] = arg0;
    } else {
        args.unshift(tag);
    }
    // tslint:disable-next-line:no-console
    console.log(...args);
}

function logServerACLImpl(server: ServServiceServer, ...args: any[]) {
    const tag = `[SERVKIT][${server.terminal.id}][${server.terminal.isMaster() ? 'M' : 'S'}] `;
    let arg0 = args[0];
    if (typeof arg0 === 'string') {
        arg0 = tag + arg0;
        args[0] = arg0;
    } else {
        args.unshift(tag);
    }
    // tslint:disable-next-line:no-console
    console.log(...args);
}

export let logSession = Env.DEV ? logSessionImpl : noop;
export let logACL = Env.DEV ? logServerACLImpl : noop;

export const setEnv = (env: Partial<typeof Env>) => {
    Object.assign(Env, env);

    logSession = Env.DEV ? logSessionImpl : noop;
    logACL = Env.DEV ? logServerACLImpl : noop;
};

const QUERY_PARAMS_KEY = '__SERVKIT_QUERY_PARAMS__';

export function generateQueryParams(params: any) {
    if (params === undefined) {
        return '';
    }

    try {
        const query = encodeURIComponent(JSON.stringify(params));
        return `${QUERY_PARAMS_KEY}=${query}`;
    } catch (e) {
        asyncThrow(e);
    }

    return '';
}

export function parseQueryParams() {
    let ret: any;
    try {
        let query = window.location.search;
        if (!query || query.indexOf(QUERY_PARAMS_KEY) < 0) {
            return;
        }

        query = query.substr(1);

        query.split("&").some((t) => {
            if (!t) {
                return false;
            }

            const n = t.split("=");
            if (!n || n.length !== 2) {
                return false;
            }

            if (n[0] !== QUERY_PARAMS_KEY) {
                return false;
            }

            ret = JSON.parse(decodeURIComponent(n[1]));
            return true;
        });
    } catch (e) {
        asyncThrow(e);
        ret = undefined;
    }
    return ret;
}

export interface Deferred<T = void> extends Promise<T> {
    reject(error?: any): void;
    resolve(): void;
    resolve(data: T): void;
}

export function createDeferred<T = void>() {
    let reject: (error: any) => void = undefined!;
    let resolve: (data?: T) => void = undefined!;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    }) as Deferred<T>;
    promise.resolve = resolve;
    promise.reject = reject;

    return promise;
}

//////////////////////////////////////
// Constant
export const EServConstant = {
    SERV_COMMON_RETURN_TIMEOUT: 15000,
    SERV_API_TIMEOUT: 30000,
    SERV_SESSION_OPEN_TIMEOUT: 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: 30000,
};

export function setServConstant(constans: Partial<typeof EServConstant>) {
    Object.assign(EServConstant, constans);
}
