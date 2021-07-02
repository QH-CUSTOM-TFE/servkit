import { IMessageOption, ImessageServiceType, MessageService } from '@example/first-example-parent-decl';
import { anno, ServAPIRetn, DeferredUtil } from 'servkit';
import { message as antdMessage } from 'antd';
import { isString } from 'lodash';

function transformMessage(content: ImessageServiceType): IMessageOption {
    if (isString(content)) {
        return {
            content,
        };
    }
    return content;
}

function showAntdMessage(content: ImessageServiceType, type: 'info' | 'success' | 'error' | 'warning' | 'warn' | 'loading') {
    const option = transformMessage(content);
    let onClose: undefined | (() => void) ;
    const deferObj = DeferredUtil.create();
    if (option.waitingClose) {
        onClose = () => {
            deferObj.resolve();
        };
    } else {
        deferObj.resolve();
    }
    antdMessage[type](option.content, option.duration, onClose);
    return deferObj;
}

@anno.impl()
export class MessageServiceImpl extends MessageService {

    info(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'info');
    }
}
