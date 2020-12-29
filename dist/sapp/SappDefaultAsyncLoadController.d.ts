import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions } from './SappMGR';
import { ServSessionConfig } from '../session/ServSession';
import { SappSDKAsyncLoadStartParams } from './SappSDK';
import { ServEventLoaderChannelConfig } from '../session/channel/ServEventLoaderChannel';
interface LayoutShowHide {
    container: HTMLElement;
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
}
export declare class SappDefaultAsyncLoadController extends SappController {
    protected layout?: LayoutShowHide;
    protected creator?: ServEventLoaderChannelConfig['master'];
    preload(): Promise<void>;
    doConfig(options: SappCreateOptions): Promise<void>;
    doShow(): Promise<void>;
    doHide(): Promise<void>;
    protected doCloseAfterAspect(): void;
    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'];
    protected resolveSharedParams(options: SappCreateOptions): SappSDKAsyncLoadStartParams;
    protected generateLoadCreator(preload?: boolean): {
        dontWaitEcho?: boolean | undefined;
        createLoader(channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): import("../session/channel/ServEventLoaderChannel").ServEventLoader;
        destroyLoader(loader: import("../session/channel/ServEventLoaderChannel").ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onCreate?(loader: import("../session/channel/ServEventLoaderChannel").ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onOpened?(loader: import("../session/channel/ServEventLoaderChannel").ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onOpenError?(channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onDestroy?(loader: import("../session/channel/ServEventLoaderChannel").ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onClosed?(channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onEcho?(loader: import("../session/channel/ServEventLoaderChannel").ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
    } & {
        preload: () => Promise<void>;
    };
}
export {};
