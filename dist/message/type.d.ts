export declare enum EServMessage {
    SERVICE = "$service",
    SESSION_CALL = "$session_call",
    SESSION_CALL_RETURN = "$session_call_return",
    SESSION_HEARTBREAK = "$session_heartbreak"
}
export declare class ServMessage {
    $id: string;
    $type: EServMessage;
}
export declare enum EServServiceMessage {
    NULL = 0,
    API = 1,
    API_RETURN = 2,
    EVENT = 3
}
export interface ServServiceMessage extends ServMessage {
    service: string;
    serviceType: EServServiceMessage;
}
export interface ServServiceReturnMessage extends ServServiceMessage {
    data?: any;
    error?: any;
}
export interface ServServiceAPIMessage extends ServServiceMessage {
    api: string;
    args?: any;
}
export interface ServServiceAPIReturnMessage extends ServServiceReturnMessage {
    api: string;
}
export interface ServServiceEventMessage extends ServServiceMessage {
    event: string;
    args?: any;
}
export interface ServSessionCallMessage<T = any> extends ServMessage {
    type: string;
    args?: T;
}
export interface ServSessionCallReturnMessage<T = any> extends ServMessage {
    data?: any;
    error?: any;
}
