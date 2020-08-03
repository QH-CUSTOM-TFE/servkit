import { ServSession } from '../session/ServSession';
export interface ConstructorOf<T> {
    new(...args: any[]): T;
}

export const Env = {
    DEV: false,
};

try {
    const jsonData = window.localStorage.getItem('__servkit.config__');
    const config = jsonData ? JSON.parse(jsonData) : {};
    Object.assign(Env, config);
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
