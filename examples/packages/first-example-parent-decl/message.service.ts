import { anno, API_UNSUPPORT, ServAPIRetn, ServService } from 'servkit';

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
    id: 'com.example.parent.message.service',
    version: '1.0.0',
})
export class MessageService extends ServService {

    @anno.decl.api()
    info(content: ImessageServiceType): ServAPIRetn<void> {
        return API_UNSUPPORT();
    }
}
