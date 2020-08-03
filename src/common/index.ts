import { ServSession } from '../session/ServSession';
export interface ConstructorOf<T> {
    new(...args: any[]): T;
}

export const Env = {
    DEV: false,
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
        Env,
    };
    const localEnv = __$$servkit.getLocalEnv();
    Object.assign(Env, localEnv);

    (window as any).__$$servkit = __$$servkit;
} catch (e) {
    //
}

export enum EServConstant {
    SERV_API_TIMEOUT = 30000,
    SERV_SESSION_OPEN_TIMEOUT = 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT = 30000,
}

export const asyncThrow = (error: any) => {
    setTimeout(() => {
        throw error;
    });
};

export const asyncThrowMessage = (msg: string) => {
    msg = `[SERVKIT] ${msg}`;
    asyncThrow(new Error(msg));
};

export const noop = () => ({});

export const logSession = Env.DEV ? function(session: ServSession, ...args: any[]) {
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
} : noop ;
