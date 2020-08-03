import { EServSession, ServSession, ServSessionPackage } from '../ServSession';
import { ServChannelObjectPackage } from './ServChannel';
import { ServWindowChannel, ServWindowChannelConfig } from './ServWindowChannel';

interface ServMessageChannelObjectPackage extends ServChannelObjectPackage {
    __chan__: string;
}

// tslint:disable-next-line:no-empty-interface
export interface ServMessageChannelConfig {

}

export class ServMessageChannel extends ServWindowChannel {
    protected config: ServMessageChannelConfig;

    open(): Promise<void> {
        if (!this.session) {
            return Promise.reject(new Error('unknown'));
        }

        if (this.isOpened()) {
            return Promise.resolve();
        }

        this.windowInfo = {
            target: window,
            window,
            origin: '*',
        };
        this.attachMessageChannel();
        this.sendable = true;

        return Promise.resolve();
    }

    protected onWindowMessage = (event: MessageEvent) => {
        if ((event.source && event.source !== this.windowInfo.window) || !event.data) {
            return;
        }
        this.recvChannelPackage(event.data);
    }
}
