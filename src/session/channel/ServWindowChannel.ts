import { asyncThrow } from '../../common/common';
import { ServChannel, ServChannelConfig, ServChannelPackage, ServChannelOpenOptions } from './ServChannel';

export interface ServChannelWindow {
    target: Window | null;
    window: Window | null;
    origin: string;
    element?: HTMLIFrameElement;
}

export interface ServChanleWindowData {
    target: Window | null;
    window?: Window;
    origin?: string;
    element?: HTMLIFrameElement;
}

export interface ServWindowChannelOpenOptions extends ServChannelOpenOptions {
    dontWaitSlaveEcho?: boolean;
}

export interface ServWindowChannelConfig extends ServChannelConfig {
    master?: {
        dontWaitEcho?: boolean;
        createWindow(channel: ServWindowChannel): ServChanleWindowData;
        destroyWindow(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onCreate?(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onOpened?(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onOpenError?(channel: ServWindowChannel): void;
        onDestroy?(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onClosed?(channel: ServWindowChannel): void;
        onEcho?(info: ServChannelWindow, channel: ServWindowChannel): void;
    };
    slave?: {
        getWindow(channel: ServWindowChannel): ServChanleWindowData;
    };
}

export class ServWindowChannel extends ServChannel {
    protected config: ServWindowChannelConfig;
    protected windowInfo: ServChannelWindow;
    protected doWaitSlaveCleanWork?: (() => void);

    open(options?: ServWindowChannelOpenOptions): Promise<void> {
        if (!this.session) {
            return Promise.reject(new Error('unknown'));
        }

        if (this.isOpened()) {
            return Promise.resolve();
        }

        this.windowInfo = {
            target: null,
            window: null,
            origin: '*',
        };

        options = options || {};

        if (this.session.isMaster()) {
            const master = this.config.master;
            if (!master) {
                return Promise.reject(new Error('Can\'t open channel without window.'));
            }

            const waitEcho = this.waitSlaveEcho(options);

            const windowInfo = master.createWindow(this);
            this.windowInfo.target = windowInfo.target;
            this.windowInfo.window = windowInfo.window || window;
            this.windowInfo.origin = windowInfo.origin || '*';
            this.windowInfo.element = windowInfo.element;

            this.attachMessageChannel();
            
            if (master.onCreate) {
                master.onCreate(this.windowInfo, this);
            }

            return waitEcho.then(() => {
                if (this.recvable) {
                    this.sendable = true;
                    if (master.onEcho) {
                        master.onEcho(this.windowInfo, this);
                    }

                    if (master.onOpened) {
                        master.onOpened(this.windowInfo, this);
                    }
                }
            }).catch((error) => {
                this.close();

                if (master.onOpenError) {
                    master.onOpenError(this);
                }
                return Promise.reject(error);
            });
        } else {
            const slave = this.config.slave;
            const windowInfo = slave ? slave.getWindow(this) : undefined;
            this.windowInfo.target = (windowInfo && windowInfo.target) || window.parent || window;
            this.windowInfo.window = (windowInfo && windowInfo.window) || window;
            this.windowInfo.origin = (windowInfo && windowInfo.origin) || '*';
            this.windowInfo.element = (windowInfo && windowInfo.element);

            this.attachMessageChannel();
            this.sendable = true;
            this.slaveEcho();
            return Promise.resolve();
        }
    }

    close(): void {
        if (!this.session) {
            return;
        }

        const oldOpened = this.isOpened();

        if (this.detachMessageChannel) {
            this.detachMessageChannel();
        }
        this.sendable = false;

        if (this.doWaitSlaveCleanWork) {
            this.doWaitSlaveCleanWork();
            this.doWaitSlaveCleanWork = undefined;
        }

        if (this.windowInfo.target || this.windowInfo.window) {
            if (this.session.isMaster() && this.config.master) {
                if (this.config.master.onDestroy) {
                    this.config.master.onDestroy(this.windowInfo, this);
                }
                this.config.master.destroyWindow(this.windowInfo, this);
            }

            this.windowInfo.target = undefined!;
            this.windowInfo.window = undefined!;
            this.windowInfo.origin = '';
            this.windowInfo.element = undefined;
        }

        if (oldOpened && this.session.isMaster() && this.config.master) {
            if (this.config.master.onClosed) {
                this.config.master.onClosed(this);
            }
        }
    }

    protected waitSlaveEcho(options: ServWindowChannelOpenOptions) {
        const master = this.config.master!;
        if (!master || master.dontWaitEcho || options.dontWaitSlaveEcho) {
            return Promise.resolve();
        }

        let res: any;
        const p = new Promise((resolve, reject) => {
            res = resolve;
        });

        const onSlaveEcho = (event: MessageEvent) => {
            if ((event.source && event.source === this.windowInfo.window) || !event.data) {
                return;
            }

            const chnPkg = event.data;

            if (chnPkg !== (`slaveecho$$${this.session.getID()}$$`)) {
                return;
            }

            res();
        };

        window.addEventListener('message', onSlaveEcho, false);

        this.doWaitSlaveCleanWork = () => {
            window.removeEventListener('message', onSlaveEcho);
        };

        return p.then(() => {
            if (this.doWaitSlaveCleanWork) {
                this.doWaitSlaveCleanWork();
                this.doWaitSlaveCleanWork = undefined;
            }
        }, (e) => {
            if (this.doWaitSlaveCleanWork) {
                this.doWaitSlaveCleanWork();
                this.doWaitSlaveCleanWork = undefined;
            }
            return Promise.reject(e);
        });
    }

    protected slaveEcho() {
        const chnPkg = `slaveecho$$${this.session.getID()}$$`;
        this.sendChannelPackage(chnPkg);
    }

    protected attachMessageChannel() {
        const chnWindow = this.windowInfo.window;
        if (!chnWindow) {
            asyncThrow(new Error('[SERVKIT] No window, attachMessageChannel failed.'));
            return;
        }

        chnWindow.addEventListener('message', this.onWindowMessage, false);
        this.recvable = true;

        this.detachMessageChannel = () => {
            this.recvable = false;
            chnWindow.removeEventListener('message', this.onWindowMessage);
        };
    }

    protected detachMessageChannel?: () => void;

    protected onWindowMessage = (event: MessageEvent) => {
        if ((event.source && event.source === this.windowInfo.window) || !event.data) {
            return;
        }
        this.recvChannelPackage(event.data);
    }

    protected sendChannelPackage(msg: ServChannelPackage): boolean {
        const targetWindow = this.windowInfo.target;
        if (!targetWindow) {
            asyncThrow(new Error('[SERVKIT] No target window, package send failed.'));
            return false;
        }

        const targetOrigin = this.windowInfo.origin;

        try {
            // Try send object message
            targetWindow.postMessage(msg, targetOrigin);
            return true;
        } catch (e) {
            asyncThrow(e);
        }

        return false;
    }
}
