import { LoadContext } from "../load/load";
import { SappInfo } from './Sapp';
export interface SappPreloadContext {
    loadContext: LoadContext;
    bootstrap?: () => (Promise<void> | void);
}
export declare class SappPreloader {
    static get instance(): SappPreloader;
    protected contexts: {
        [key: string]: SappPreloadContext;
    };
    constructor();
    getPreloadDeferred(id: string): import("..").Deferred<void> | undefined;
    getPreloadBootstrap(id: string): (() => void | Promise<void>) | undefined;
    setPreloadBootstrap(id: string, bootstrap: () => (Promise<void> | void)): void;
    load(info: SappInfo): import("..").Deferred<void>;
}
