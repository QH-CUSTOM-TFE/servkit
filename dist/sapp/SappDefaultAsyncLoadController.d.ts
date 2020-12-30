import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions } from './SappMGR';
import { ServSessionConfig } from '../session/ServSession';
import { SappSDKAsyncLoadStartParams } from './SappSDK';
import { ServEventLoader } from '../session/channel/ServEventLoaderChannel';
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
    doShow(): Promise<void>;
    doHide(): Promise<void>;
    protected doCloseAfterAspect(): void;
    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'];
    protected resolveSharedParams(options: SappCreateOptions): SappSDKAsyncLoadStartParams;
    protected generateLoadCreator(): {
        dontWaitEcho?: boolean | undefined;
        createLoader(channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): ServEventLoader;
        destroyLoader(loader: ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onCreate?(loader: ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onOpened?(loader: ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onOpenError?(channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onDestroy?(loader: ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onClosed?(channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
        onEcho?(loader: ServEventLoader, channel: import("../session/channel/ServEventLoaderChannel").ServEventLoaderChannel): void;
    };
}
export {};
