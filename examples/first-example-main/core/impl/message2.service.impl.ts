import { ImessageServiceType, Message2Service } from '@example/first-example-decl';
import { anno, ServAPIRetn } from 'servkit';
import { showAntdMessage } from './message.service.impl';

const message2Prefix = 'message2';

@anno.impl()
export class Message2ServiceImpl extends Message2Service {

    info(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'info', message2Prefix);
    }

    info2(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content + 'info2', 'info', message2Prefix);
    }

    success(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'success', message2Prefix);
    }

    error(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'error', message2Prefix);
    }

    warning(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'warning', message2Prefix);
    }

    warn(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'warn', message2Prefix);
    }

    loading(content: ImessageServiceType): ServAPIRetn<void> {
        return showAntdMessage(content, 'loading', message2Prefix);
    }
}
