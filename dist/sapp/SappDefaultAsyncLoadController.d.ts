import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions } from './SappMGR';
import { ServSessionConfig } from '../session/ServSession';
import { SappSDKAsyncLoadStartParams } from './SappSDK';
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
}
export {};
