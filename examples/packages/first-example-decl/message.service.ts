import { anno, API_UNSUPPORT, ServAPIRetn, ServEventer, ServService } from 'servkit';

export interface IMessageOption {
    /**
     * 消息内容
     */
    content: string;
    /**
     * 执行续时间
     */
    duration?: number;
    /**
     * 一直等待到close时，才响应
     */
    waitingClose?: boolean;
}

export type ImessageServiceType = string | IMessageOption;

@anno.decl({
    id: 'com.example.message.service',
    version: '1.0.0',
})
export class MessageService extends ServService {

    @anno.decl.api()
    info(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    success(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    error(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    warning(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    warn(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

    @anno.decl.api()
    loading(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }

}
