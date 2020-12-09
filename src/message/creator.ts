import { ServServiceGetVersionMessage, ServServiceGetVersionReturnMessage } from './type';
import { nextUUID } from '../common/index';
import {
    EServMessage,
    EServServiceMessage,
    ServMessage,
    ServServiceAPIMessage,
    ServServiceAPIReturnMessage,
    ServServiceEventMessage,
    ServServiceMessage,
    ServServiceReturnMessage,
    ServSessionCallMessage,
    ServSessionCallReturnMessage,
} from './type';

export class ServMessageCreator {
    static create(type: EServMessage): ServMessage {
        return {
            $id: nextUUID(),
            $type: type,
        };
    }

    static clone(origin: ServMessage): ServMessage {
        return {
            $id: origin.$id,
            $type: origin.$type,
        };
    }
}

export class ServServiceMessageCreator {
    static create(type: EServServiceMessage, service: string): ServServiceMessage {
        const msg = ServMessageCreator.create(EServMessage.SERVICE) as ServServiceMessage;
        msg.service = service;
        msg.serviceType = type;

        return msg;
    }

    static createReturn(origin: ServServiceGetVersionMessage, type: EServServiceMessage,
                        data: any, error?: any): ServServiceGetVersionReturnMessage {
        const msg = ServServiceMessageCreator.clone(origin) as ServServiceGetVersionReturnMessage;
        msg.serviceType = type;
        msg.data = data;
        msg.error = error;

        return msg;
    }

    static clone(origin: ServServiceMessage): ServServiceMessage {
        const msg = ServMessageCreator.clone(origin) as ServServiceMessage;
        msg.service = origin.service;
        msg.serviceType = origin.serviceType;

        return msg;
    }

    static createAPI(service: string, api: string, args?: any): ServServiceAPIMessage {
        const msg = ServServiceMessageCreator.create(EServServiceMessage.API, service) as ServServiceAPIMessage;
        msg.api = api;
        msg.args = args;

        return msg;
    }

    static createAPIReturn(origin: ServServiceAPIMessage, data?: any, error?: any): ServServiceAPIReturnMessage {
        const msg = ServServiceMessageCreator.clone(origin) as ServServiceAPIReturnMessage;
        msg.serviceType = EServServiceMessage.API_RETURN;
        msg.api = origin.api;
        msg.data = data;
        msg.error = error;

        return msg;
    }

    static createEvent(service: string, event: string, args?: any): ServServiceEventMessage {
        const msg = ServServiceMessageCreator.create(EServServiceMessage.EVENT, service) as ServServiceEventMessage;
        msg.event = event;
        msg.args = args;

        return msg;
    }

    static isServiceMessage(message: ServMessage): boolean {
        return message.$type === EServMessage.SERVICE;
    }

    static isAPIMessage(message: ServServiceMessage): boolean {
        return message.serviceType === EServServiceMessage.API && ServServiceMessageCreator.isServiceMessage(message);
    }

    static isEventMessage(message: ServServiceMessage): boolean {
        return message.serviceType === EServServiceMessage.EVENT && ServServiceMessageCreator.isServiceMessage(message);
    }

    static isAPIReturnMessage(message: ServServiceReturnMessage, origin?: ServServiceMessage) {
        return message.serviceType === EServServiceMessage.API_RETURN
        && ServServiceMessageCreator.isServiceMessage(message) && (origin ? message.$id === origin.$id : true);
    }

    static isGetVersionMessage(message: ServServiceMessage): boolean {
        return message.serviceType === EServServiceMessage.GET_VERSION
            && ServServiceMessageCreator.isServiceMessage(message);
    }

    static isGetVersionReturnMessage(message: ServServiceMessage, origin?: ServServiceMessage): boolean {
        return message.serviceType === EServServiceMessage.GET_VERSION_RETURN
            && ServServiceMessageCreator.isServiceMessage(message) && (origin ? message.$id === origin.$id : true);
    }
}

export class ServSessionCallMessageCreator {
    static create(type: string, args: any): ServSessionCallMessage {
        const msg = ServMessageCreator.create(EServMessage.SESSION_CALL) as ServSessionCallMessage;
        msg.type = type;
        msg.args = args;

        return msg;
    }

    static createReturn(origin: ServSessionCallMessage, data?: any, error?: any): ServSessionCallReturnMessage {
        const msg = ServMessageCreator.clone(origin) as ServSessionCallReturnMessage;
        msg.$type = EServMessage.SESSION_CALL_RETURN;
        msg.data = data;
        msg.error = error;

        return msg;
    }

   static isCallMessage(message: ServMessage): boolean {
        return message.$type === EServMessage.SESSION_CALL;
    }

    static isCallReturnMessage(message: ServMessage, origin?: ServSessionCallMessage): boolean {
        return message.$type === EServMessage.SESSION_CALL_RETURN && (origin ? message.$id === origin.$id : true);
    }
}
