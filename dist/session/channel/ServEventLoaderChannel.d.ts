import { ServEventChannel, ServEventChannelConfig } from './ServEventChannel';
import { ServChannelPackage, ServChannelOpenOptions } from './ServChannel';
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
    slave?: {};
}
export declare class ServEventLoaderChannel extends ServEventChannel {
    protected loader: ServEventLoader;
    protected config: ServEventLoaderChannelConfig;
    protected doWaitSlaveCleanWork?: (() => void);
    protected tryWaitSlaveEcho?: (msg: ServChannelPackage) => void;
    open(options?: ServEventLoaderChannelOpenOptions): Promise<void>;
    close(): void;
    protected waitSlaveEcho(options: ServEventLoaderChannelOpenOptions): Promise<void>;
    recvChannelPackage(msg: ServChannelPackage): void;
    protected slaveEcho(): void;
}
