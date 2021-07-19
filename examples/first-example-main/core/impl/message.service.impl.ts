import { IMessageOption, ImessageServiceType, MessageService } from '@example/first-example-decl';
import { anno, ServAPIRetn } from 'servkit';
import { message as antdMessage } from 'antd';
import { isString } from 'lodash';
import { defer } from '../../util/promise';

export function applyPrefix(content: string, prefix?: string) {
    return `${prefix ? prefix + ': ' : ''}${content}`;
}

export function transformMessage(content: ImessageServiceType, prefix = ''): IMessageOption {
    if (isString(content)) {
        const newContent = applyPrefix(content, prefix);
        return {
            content: newContent,
        };
    }
    return {
        ...content,
        content: applyPrefix(content.content, prefix),
    };
}

export function showAntdMessage(content: ImessageServiceType, type: 'info' | 'success' | 'error' | 'warning' | 'warn' | 'loading', prefix = 'message1') {
    const option = transformMessage(content, prefix);
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
