import { ConstructorOf, EServConstant } from '../common/index';
import { ServServiceMessageCreator } from '../message/creator';
import { ServMessageContextManager } from '../message/ServMessageContextManager';
import { ServMessage, ServServiceEventMessage, ServServiceMessage, ServServiceReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { ServEventerManager } from './event/ServEventerManager';
import { ServAPI, ServAPIMeta, ServEventerMeta, ServService, util } from './ServService';

// tslint:disable-next-line:no-empty-interface
export interface ServServiceClientConfig {

}

export class ServServiceClient {
    protected messageContextManager: ServMessageContextManager;
    protected eventerManager: ServEventerManager;
    protected services: { [key: string]: ServService };
    protected terminal: ServTerminal;
    protected sessionUnlisten?: (() => void);

    constructor(terminal: ServTerminal) {
        this.terminal = terminal;
    }

    init(confit?: ServServiceClientConfig) {
        this.services = {};

        this.messageContextManager = new ServMessageContextManager();
        this.messageContextManager.init();

        this.eventerManager = new ServEventerManager();
        this.eventerManager.init();

        this.sessionUnlisten = this.terminal.session.onRecvMessage(this.onRecvMessage);
    }

    release() {
        if (this.sessionUnlisten) {
            this.sessionUnlisten();
            this.sessionUnlisten = undefined;
        }

        this.eventerManager.release();
        this.messageContextManager.release();
        this.services = {};
    }

    getService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined {
        const metas = util.meta(decl);
        if (!metas) {
            return;
        }

        const id = metas.id;
        let service: ServService | undefined = this.services[id];
        if (service) {
            return service as InstanceType<T>;
        }

        // TODO
        // Do version check work

        service = this.generateService(decl);
        if (service) {
            this.services[name] = service;
        }

        return service as InstanceType<T>;
    }

    serviceExec<T extends ConstructorOf<any>, R>(decl: T, exec: ((service: InstanceType<T>) => R)) {
        const service = this.getService(decl);
        if (!service) {
            return null;
        }

        return exec(service);
    }

    private generateService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined {
        const metas = util.meta(decl);
        if (!metas) {
            return;
        }

        const obj = new decl();
        const id = metas.id;

        metas.apis.forEach((item) => {
            obj[item.name] = this.generateServiceAPI(id, item);
        });

        metas.evts.forEach((item) => {
            obj[item.name] = this.generateServiceEvent(id, item);
        });

        return obj;
    }

    private generateServiceAPI(service: string, meta: ServAPIMeta) {
        const self = this;
        const ret: ServAPI<any> = function(args, options) {
            const message = ServServiceMessageCreator.createAPI(service, meta.name, args);
            const addOptions = {
                timeout: (options && options.timeout) || EServConstant.SERV_API_TIMEOUT,
                prewait: self.sendMessage(message),
            };

            let promise = self.messageContextManager.add(message, addOptions);
            if (!promise) {
                promise = self.messageContextManager.getPromise(message.$id);
            }

            if (!promise) {
                promise = Promise.reject(new Error('unknown'));
            }

            return promise;
        };

        return ret;
    }

    private generateServiceEvent(service: string, meta: ServEventerMeta) {
        return this.eventerManager.spawn(service, meta.name);
    }

    private sendMessage(message: ServMessage): Promise<void> {
        return this.terminal.session.sendMessage(message);
    }

    protected onRecvMessage = (message: ServMessage): boolean => {
        // handle return message
        if (!ServServiceMessageCreator.isServiceMessage(message)) {
            return false;
        }

        const origin = this.messageContextManager.get(message.$id);
        if (origin
            && ServServiceMessageCreator.isAPIReturnMessage(
                message as ServServiceReturnMessage,
                origin as ServServiceMessage)
            ) {
            return this.handleAPIReturnMessage(message as ServServiceReturnMessage, origin as ServServiceMessage);
        }

        if (ServServiceMessageCreator.isEventMessage(message as ServServiceMessage)) {
            return this.handleEventMessage(message as ServServiceEventMessage);
        }

        return false;
    }

    protected handleAPIReturnMessage(message: ServServiceReturnMessage, origin: ServServiceMessage): boolean {
        if (message.error) {
            return this.messageContextManager.failed(message.$id, message.error);
        } else {
            return this.messageContextManager.succeed(message.$id, message.data);
        }
    }

    protected handleEventMessage(message: ServServiceEventMessage): boolean {
        this.eventerManager.rawEmit(message.service, message.event, message.args);
        return true;
    }
}
