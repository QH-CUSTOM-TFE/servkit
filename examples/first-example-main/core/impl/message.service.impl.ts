import { IMessageOption, ImessageServiceType, MessageService } from '@example/first-example-decl';
import { anno, ServAPIRetn } from 'servkit';
import { message as antdMessage } from 'antd';
import { isString } from 'lodash';
import { defer } from '../../util/promise';

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
    const deferObj = defer();
    if (option.waitingClose) {
        onClose = () => {
            deferObj.resolve();
        };
    } else {
        deferObj.resolve();
    }
    antdMessage[type](option.content, option.duration, onClose);
    return deferObj.promise;
}

@anno.impl()
export class MessageServiceImpl extends MessageService {

    info(content: ImessageServiceType): ServAPIRetn<void> {
        const result = this.getContext();
        console.log(result);
        return showAntdMessage(content, 'info');
    }

    success(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'success');
    }

    error(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'error');
    }

    warning(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'warning');
    }

    warn(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'warn');
    }

    loading(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'loading');
    }
}
