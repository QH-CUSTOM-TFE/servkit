import { ConstructorOf } from '../common/index';
import { ServServiceMessageCreator } from '../message/creator';
import { ServMessage, ServServiceAPIMessage, ServServiceMessage, ServServiceReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { ServService, util } from './ServService';
import {
    ServServiceConfig,
    ServServiceManager,
    ServServiceOnEmitListener,
    ServServiceOptions,
    ServServiceRefer,
    ServServiceReferPattern,
} from './ServServiceManager';

// tslint:disable-next-line:no-empty-interface
export interface ServServiceServerConfig {
    service?: ServServiceConfig;
    serviceRefer?: ServServiceReferPattern;
}

export class ServServiceServer {
    protected service: ServServiceManager;
    protected serviceRefer?: ServServiceRefer;
    protected terminal: ServTerminal;
    protected sessionUnlisten?: (() => void);

    constructor(terminal: ServTerminal) {
        this.terminal = terminal;
    }

    init(config?: ServServiceServerConfig) {
        config = config || {};

        this.service = new ServServiceManager();
        this.service.init(config.service);
        this.service.onEvnterEmit = this.onEventerEmit;

        if (config.serviceRefer) {
            this.serviceRefer = this.terminal.servkit.service.referServices(config.serviceRefer);
            this.serviceRefer.onEvnterEmit = this.onEventerEmit;
        }

        this.sessionUnlisten = this.terminal.session.onRecvMessage(this.onRecvMessage);
    }

    release() {
        if (this.sessionUnlisten) {
            this.sessionUnlisten();
            this.sessionUnlisten = undefined;
        }

        if (this.serviceRefer) {
            this.serviceRefer.detach();
            this.serviceRefer = undefined;
        }
        this.service.release();
    }

    serviceExec<T extends ConstructorOf<any>, R>(decl: T, exec: ((service: InstanceType<T>) => R)) {
        const service = this.getService(decl);
        if (!service) {
            return null;
        }

        return exec(service);
    }

    serviceExecByID<T extends ServService, R>(id: string, exec: ((service: T) => R)): R | null {
        const service = this.getServiceByID<T>(id);
        if (!service) {
            return null;
        }

        return exec(service);
    }

    getServiceByID<T extends ServService>(id: string): T | undefined {
        let service = this.service.getServiceByID<T>(id);
        if (!service) {
            service = this.serviceRefer ? this.serviceRefer.getServiceByID(id) : undefined;
        }

        return service as T;
    }

    getService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined {
        const meta = util.meta(decl);
        if (!meta) {
            return;
        }

        return this.getServiceByID<InstanceType<T>>(meta.id);
    }

    addService<D extends typeof ServService, I extends D>(decl: D, impl: I, options?: ServServiceOptions): boolean {
        return this.service.addService(decl, impl, options);
    }

    addServices(
        items: Array<{ decl: typeof ServService, impl: typeof ServService, options?: ServServiceOptions }>,
        options?: ServServiceOptions,
    ): void {
        this.service.addServices(items, options);
    }

    protected onRecvMessage = (message: ServMessage): boolean => {
        // Only care about 'service message'
        if (!ServServiceMessageCreator.isServiceMessage(message)) {
            return false;
        }

        const servMessage = message as ServServiceMessage;
        if (ServServiceMessageCreator.isAPIMessage(servMessage)) {
            return this.handleAPIMessage(servMessage as ServServiceAPIMessage);
        }

        return false;
    }

    protected handleAPIMessage(message: ServServiceAPIMessage): boolean {
        const id = message.service;
        const service = this.getServiceByID<any>(id);

        let retnPromise: Promise<any>;
        
        if (!service) {
            retnPromise = Promise.reject(new Error(`Unknown service [${id}]`));
        } else {
            const api = message.api;
            if (typeof service[api] !== 'function') {
                retnPromise = Promise.reject(new Error(`Unknown api [${api}] in service ${id}`));
            } else {
                try {
                    retnPromise = Promise.resolve(service[api](message.args));
                } catch (e) {
                    retnPromise = Promise.reject(e);
                }
            }
        }
            
        this.sendReturnMessage(retnPromise, message, ServServiceMessageCreator.createAPIReturn);

        return true;
    }

    protected sendReturnMessage(
        retnPromise: Promise<any>,
        origin: ServServiceMessage,
        retnCreator: (message: ServServiceMessage, data?: any, error?: any) => ServServiceReturnMessage,
    ): void {
        retnPromise.then((data) => {
            const retnMesage = retnCreator(origin, data);
            this.sendMessage(retnMesage);
        }, (error) => {
            const retnMesage = retnCreator(origin, undefined, error);
            this.sendMessage(retnMesage);
        });
    }

    protected sendMessage(message: ServMessage): Promise<void> {
        return this.terminal.session.sendMessage(message);
    }

    protected sendEventMessage(
        session: any,
        retnPromise: Promise<any>,
        origin: ServServiceMessage,
        retnCreator: (message: ServServiceMessage, data?: any, error?: any) => ServServiceReturnMessage,
    ): void {
        retnPromise.then((data) => {
            const retnMesage = retnCreator(origin, data);
            this.sendMessage(retnMesage);
        }, (error) => {
            const retnMesage = retnCreator(origin, undefined, error);
            this.sendMessage(retnMesage);
        });
    }

    protected onEventerEmit: ServServiceOnEmitListener = (service, event, args) => {
        const message = ServServiceMessageCreator.createEvent(service, event, args);
        return this.sendMessage(message).catch(() => undefined);
    }
}
