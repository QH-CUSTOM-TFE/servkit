import { ServWindowChannel, ServWindowChannelOpenOptions } from './ServWindowChannel';

// tslint:disable-next-line:no-empty-interface
export interface ServMessageChannelConfig {

}

export class ServMessageChannel extends ServWindowChannel {
    protected config: ServMessageChannelConfig;

    open(options?: ServWindowChannelOpenOptions): Promise<void> {
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
