import { Sapp, SappStartOptions } from './Sapp';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
export declare class SappPlainPage extends Sapp {
    start: ((options?: SappStartOptions | undefined) => Promise<void>) & {
        deferred: import("../common/Deferred").Deferred<void> | undefined;
    };
    show(params?: SappShowParams): Promise<boolean>;
    hide(params?: SappHideParams): Promise<boolean>;
    protected _show: ((params?: SappShowParams | undefined, byCreate?: boolean | undefined) => Promise<boolean>) & {
        deferred: import("../common/Deferred").Deferred<void> | undefined;
    };
    protected _hide: ((params?: SappHideParams | undefined, byClose?: boolean | undefined) => Promise<boolean>) & {
        deferred: import("../common/Deferred").Deferred<void> | undefined;
    };
    close: ((result?: SappCloseResult | undefined) => Promise<boolean>) & {
        deferred: import("../common/Deferred").Deferred<void> | undefined;
    };
    protected initTerminal(options: SappStartOptions): Promise<void>;
}
