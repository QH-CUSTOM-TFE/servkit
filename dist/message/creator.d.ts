import { ServServiceGetVersionMessage, ServServiceGetVersionReturnMessage } from './type';
import { EServMessage, EServServiceMessage, ServMessage, ServServiceAPIMessage, ServServiceAPIReturnMessage, ServServiceEventMessage, ServServiceMessage, ServServiceReturnMessage, ServSessionCallMessage, ServSessionCallReturnMessage } from './type';
export declare class ServMessageCreator {
    private static id;
    static create(type: EServMessage): ServMessage;
    static clone(origin: ServMessage): ServMessage;
    static nextID(): string;
}
export declare class ServServiceMessageCreator {
    static create(type: EServServiceMessage, service: string): ServServiceMessage;
    static createReturn(origin: ServServiceGetVersionMessage, type: EServServiceMessage, data: any, error?: any): ServServiceGetVersionReturnMessage;
    static clone(origin: ServServiceMessage): ServServiceMessage;
    static createAPI(service: string, api: string, args?: any): ServServiceAPIMessage;
    static createAPIReturn(origin: ServServiceAPIMessage, data?: any, error?: any): ServServiceAPIReturnMessage;
    static createEvent(service: string, event: string, args?: any): ServServiceEventMessage;
    static isServiceMessage(message: ServMessage): boolean;
    static isAPIMessage(message: ServServiceMessage): boolean;
    static isEventMessage(message: ServServiceMessage): boolean;
    static isAPIReturnMessage(message: ServServiceReturnMessage, origin?: ServServiceMessage): boolean;
    static isGetVersionMessage(message: ServServiceMessage): boolean;
    static isGetVersionReturnMessage(message: ServServiceMessage): boolean;
}
export declare class ServSessionCallMessageCreator {
    static create(type: string, args: any): ServSessionCallMessage;
    static createReturn(origin: ServSessionCallMessage, data?: any, error?: any): ServSessionCallReturnMessage;
    static isCallMessage(message: ServMessage): boolean;
    static isCallReturnMessage(message: ServMessage, origin?: ServSessionCallMessage): boolean;
}
