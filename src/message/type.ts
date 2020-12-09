export enum EServMessage {
    SERVICE = '$service',
    SESSION_CALL = '$session_call',
    SESSION_CALL_RETURN = '$session_call_return',
    SESSION_HEARTBREAK = '$session_heartbreak',
}

export class ServMessage {
    $id: string;
    $type: EServMessage;
}

export enum EServServiceMessage {
    NULL = 0,
    API,
    API_RETURN,
    EVENT,
    GET_VERSION,
    GET_VERSION_RETURN,
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

// tslint:disable-next-line:no-empty-interface
export interface ServServiceGetVersionMessage extends ServServiceMessage {
    
}

// tslint:disable-next-line:no-empty-interface
export interface ServServiceGetVersionReturnMessage extends ServServiceReturnMessage {
}

export interface ServSessionCallMessage<T = any> extends ServMessage {
    type: string;
    args?: T;
}

export interface ServSessionCallReturnMessage<T = any> extends ServMessage {
    data?: any;
    error?: any;
}
