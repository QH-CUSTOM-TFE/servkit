import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions } from './SappMGR';
import { ServIFrameWindowInfo } from '../window/iframe';
import { ServSessionConfig } from '../session/ServSession';
interface LayoutShowHide {
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
}
export declare class SappDefaultIFrameController extends SappController {
    protected windowInfo: ServIFrameWindowInfo;
    protected layout: LayoutShowHide;
    doShow(): Promise<void>;
    doHide(): Promise<void>;
    protected doCloseAfterAspect(): void;
    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'];
    protected resolveQueryParams(options: SappCreateOptions): {
        uuid: string;
    };
}
export {};
