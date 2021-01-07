import { ServSession } from '../ServSession';
import { ServChannel, ServChannelConfig, ServChannelPackage, ServChannelOpenOptions } from './ServChannel';

// tslint:disable-next-line:no-empty-interface
export interface ServEventChannelConfig extends ServChannelConfig {
}

export class ServEventChannel extends ServChannel {
    protected config: ServEventChannelConfig;
    protected asyncDispatchPromise: Promise<void>;

    init(session: ServSession, config: ServEventChannelConfig) {
        if (config && config.ignoreSenderType) {
            config.ignoreSenderType = false;
        }
        
        super.init(session, config);

        this.asyncDispatchPromise = Promise.resolve();
    }

    open(options?: ServChannelOpenOptions): Promise<void> {
        if (!this.session) {
            return Promise.reject(new Error('unknown'));
        }

        if (this.isOpened()) {
            return Promise.resolve();
        }

        this.attachMessageChannel();
        this.sendable = true;

        return Promise.resolve();
    }

    close(): void {
        if (!this.session) {
            return;
        }

        this.detachMessageChannel();
        this.sendable = false;
    }

    protected attachMessageChannel() {
        window.addEventListener(this.recvStringMark, this.onEventMessage, false);
        this.recvable = true;
    }

    protected detachMessageChannel() {
        this.recvable = false;
        window.removeEventListener(this.recvStringMark, this.onEventMessage);
    }

    protected onEventMessage = (event: CustomEvent) => {
        const pkg = event.detail;
        if (!event.detail) {
            return;
        }

        this.recvChannelPackage(pkg);
    }

    protected sendChannelPackage(pkg: ServChannelPackage): boolean {
        this.asyncDispatchPromise.then(() => {
            const event = new CustomEvent(this.sendStringMark, { detail: pkg });
            window.dispatchEvent(event);
        });

        return true;
    }
}
