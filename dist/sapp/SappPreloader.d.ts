import { LoadContext } from "../load/load";
import { SappInfo } from './Sapp';
export interface SappPreloadContext {
    loadContext: LoadContext;
}
export declare class SappPreloader {
    static get instance(): SappPreloader;
    protected contexts: {
        [key: string]: SappPreloadContext;
    };
    constructor();
    getPreloadDeferred(id: string): import("..").Deferred<void> | undefined;
    load(info: SappInfo): import("..").Deferred<void>;
}
