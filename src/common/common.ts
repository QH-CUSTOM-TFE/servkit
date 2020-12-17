import { ServSession } from '../session/ServSession';
import { ServServiceServer } from '../service/ServServiceServer';

export const Env = {
    DEV: false,
    JEST: false,
};

try {
    if ((window as any).__$$servkit) {
        asyncThrowMessage(`
        NOTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        YOU HAVE MULTIPLE VERSIONS OF SERVKIT INSTALLED IN YOUR PROJECT, AND THIS WILL PRODUCE ERROR.
        PLEASE FIX IT.
        `);
    }
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

export const EServConstant = {
    SERV_APP_SHOW_HIDE_TIMEOUT: 5000,
    SERV_SAPP_ON_START_TIMEOUT: 30000,
    SERV_COMMON_RETURN_TIMEOUT: 15000,
    SERV_API_TIMEOUT: 30000,
    SERV_SESSION_OPEN_TIMEOUT: 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: 30000,
    SAPP_HIDE_MAX_TIME: 36000000,
};

export function setServConstant(constans: Partial<typeof EServConstant>) {
    Object.assign(EServConstant, constans);
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

export function noop() {
    //
}

export function asyncThrow(error: any) {
    try {
        if (!(error instanceof Error)) {
            error = new Error(error && error.toString ? error.toString() : 'unknown');
        }
        if (!Env.JEST) {
            setTimeout(() => {
                throw error;
            });
        } else {
            // tslint:disable-next-line:no-console
            console.log(error);
        }
    } catch (e) {
        //
    }
}

export function asyncThrowMessage(msg: string) {
    msg = `[SERVKIT] ${msg}`;
    asyncThrow(new Error(msg));
}

let nextId = 0;
const startTimestamp = Date.now();
export function nextUUID() {
    ++nextId;
    return `${startTimestamp}-${Date.now()}-${nextId}`;
}

export function safeExec<T extends (...args: any) => any>(func: T): ReturnType<T> {
    try {
        return func();
    } catch (e) {
        asyncThrow(e);
    }

    return undefined as any;
}
