import { LoadContext, LoadUtil } from "../load/load";
import { SappInfo, ESappType, Sapp } from './Sapp';
import { asyncThrow } from '../common/common';

export interface SappPreloadContext {
    loadContext: LoadContext;
}

let sInstance: SappPreloader;
export class SappPreloader {
    static get instance() {
        if (!sInstance) {
            sInstance = new SappPreloader();
        }

        return sInstance;
    }

    protected contexts: { [key: string]: SappPreloadContext };

    constructor() {
        this.contexts = {};
    }

    getPreloadDeferred(id: string) {
        const context = this.contexts[id];
        if (!context) {
            return;
        }
        
        return context ? context.loadContext.loaded : undefined;
    }

    load(info: SappInfo) {
        if (info.type !== ESappType.ASYNC_LOAD) {
            throw new Error(`[SAPPMGR] Only async load app support preload`);
        }

        const context = this.contexts[info.id];
        if (context) {
            return context.loadContext.loaded;
        }

        let loadContext: LoadContext | undefined;
        if (info.url) {
            const url = Sapp.transformContentByInfo(info.url, info);
            loadContext = LoadUtil.loadScript({ url });
        } else if (info.html) {
            const html = Sapp.transformContentByInfo(info.html, info);
            loadContext = LoadUtil.loadHtml({ html });
        }

        if (!loadContext) {
            throw new Error(`[SAPPMGR] Preload fail`);
        }

        this.contexts[info.id] = {
            loadContext,
        };

        loadContext.loaded.catch(() => {
            loadContext!.clean();
            delete this.contexts[info.id];
        });

        return loadContext.loaded;
    }
}
