import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { ServSessionConfig } from '../session/ServSession';
import { SappSDKAsyncLoadStartParams } from './SappSDK';
import { SappCloseResult } from './service/m/SappLifecycle';
interface LayoutShowHide {
    options: SappLayoutOptions;
    container: HTMLElement;
    doStart?: ((app: Sapp) => void);
    doClose?: ((app: Sapp) => void);
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
}
export declare class SappDefaultAsyncLoadController extends SappController {
    protected layout?: LayoutShowHide;
    doStart(): Promise<void>;
    doClose(result?: SappCloseResult): Promise<void>;
    doShow(): Promise<void>;
    doHide(): Promise<void>;
    protected doCloseAfterAspect(): void;
    protected resetLayout(options: SappLayoutOptions): void;
    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'];
    protected resolveSharedParams(options: SappCreateOptions): SappSDKAsyncLoadStartParams;
    protected generateLoadCreator(options: SappCreateOptions): {
        createLoader: (channel: any) => {
            load: () => Promise<void>;
        };
        destroyLoader: (loader: any, channel: any) => void;
    };
}
export {};
