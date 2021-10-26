import { ServEventChannel, ServEventChannelConfig } from './ServEventChannel';
import { ServChannelPackage, ServChannelOpenOptions } from './ServChannel';
import { DeferredUtil } from '../../common/Deferred';
import { safeExec } from '../../common/common';

export interface ServEventLoader {
    load(): Promise<void>;
}

export interface ServEventLoaderChannelOpenOptions extends ServChannelOpenOptions {
    dontWaitSlaveEcho?: boolean;
}

export interface ServEventLoaderChannelConfig extends ServEventChannelConfig {
    master?: {
        dontWaitEcho?: boolean;
        createLoader(channel: ServEventLoaderChannel): ServEventLoader;
        destroyLoader(loader: ServEventLoader, channel: ServEventLoaderChannel): void;
        onCreate?(loader: ServEventLoader, channel: ServEventLoaderChannel): void;
        onOpened?(loader: ServEventLoader, channel: ServEventLoaderChannel): void;
        onOpenError?(channel: ServEventLoaderChannel): void;
        onDestroy?(loader: ServEventLoader, channel: ServEventLoaderChannel): void;
        onClosed?(channel: ServEventLoaderChannel): void;
        onEcho?(loader: ServEventLoader, channel: ServEventLoaderChannel): void;
    };
    slave?: {
        //
    };
}

export class ServEventLoaderChannel extends ServEventChannel {
    protected loader: ServEventLoader;
    protected config: ServEventLoaderChannelConfig;
    protected doWaitSlaveCleanWork?: (() => void);
    protected tryWaitSlaveEcho?: (msg: ServChannelPackage) => void;
    
    open(options?: ServEventLoaderChannelOpenOptions): Promise<void> {
        if (this.isOpened()) {
            return Promise.resolve();
        }

        super.open(options);

        options = options || {};
    
        this.sendable = false;
        if (this.session.isMaster()) {
            const master = this.config.master;
            if (!master) {
                throw new Error('Can\'t open channel without window.');
            }

            const waitEcho = this.waitSlaveEcho(options);

            const loader = master.createLoader(this);
            this.loader = loader;
            if (master.onCreate) {
                master.onCreate(loader, this);
            }

            return loader.load().then(() => {
                return waitEcho;
            }).then(() => {
                if (this.recvable) {
                    this.sendable = true;
                    if (master.onEcho) {
                        master.onEcho(loader, this);
                    }

                    if (master.onOpened) {
                        master.onOpened(loader, this);
                    }
                }
            }).catch((error) => {
                if (master.onOpenError) {
                    safeExec(() => master.onOpenError!(this));
                }

                this.close();

                return Promise.reject(error);
            });
        } else {
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

        super.close();

        if (this.loader) {
            if (this.session.isMaster() && this.config.master) {
                if (this.config.master.onDestroy) {
                    this.config.master.onDestroy(this.loader, this);
                }

                this.config.master.destroyLoader(this.loader, this);
            }

            this.loader = undefined!;
        }

        if (oldOpened && this.session.isMaster() && this.config.master) {
            if (this.config.master.onClosed) {
                this.config.master.onClosed(this);
            }
        }
    }

    protected waitSlaveEcho(options: ServEventLoaderChannelOpenOptions) {
        const master = this.config.master!;
        if (!master || master.dontWaitEcho || options.dontWaitSlaveEcho) {
            return Promise.resolve();
        }

        const wait = DeferredUtil.create();

        this.tryWaitSlaveEcho = (msg) => {
            if (msg !== (`slaveecho$$${this.session.getID()}$$`)) {
                return;
            }

            wait.resolve();
        };

        this.doWaitSlaveCleanWork = () => {
            this.tryWaitSlaveEcho = undefined;
        };

        return wait.then(() => {
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

    recvChannelPackage(msg: ServChannelPackage) {
        if (this.tryWaitSlaveEcho) {
            this.tryWaitSlaveEcho(msg);
            return;
        }
        super.recvChannelPackage(msg);
    }

    protected slaveEcho() {
        const chnPkg = `slaveecho$$${this.session.getID()}$$`;
        this.sendChannelPackage(chnPkg);
    }
}
