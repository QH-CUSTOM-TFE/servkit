import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { ServIFrameWindowInfo } from '../window/iframe';
import { ServSessionConfig } from '../session/ServSession';
import { SappSDKStartParams } from './SappSDK';
import { SappCloseResult } from './service/m/SappLifecycle';
interface LayoutShowHide {
    options: SappLayoutOptions;
    container?: HTMLElement;
    doStart?: ((app: Sapp) => void);
    doClose?: ((app: Sapp) => void);
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
    className?: string;
    style?: SappLayoutOptions['style'];
}
export declare class SappDefaultIFrameController extends SappController {
    protected windowInfo: ServIFrameWindowInfo;
    protected layout: LayoutShowHide;
    doStart(): Promise<void>;
    doClose(result?: SappCloseResult): Promise<void>;
    doShow(): Promise<void>;
    doHide(): Promise<void>;
    protected doCloseAfterAspect(): void;
    protected resetLayout(options: SappLayoutOptions): void;
    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'];
    protected resolveQueryParams(options: SappCreateOptions): SappSDKStartParams;
}
export {};
