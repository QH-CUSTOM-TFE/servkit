import { asyncThrow, ConstructorOf } from '../common/index';
import { ServEventerManager, ServEventerOnEmitListener } from './event/ServEventerManager';
import { EServImplInject, ServService, ServServiceMeta, util } from './ServService';

interface ServServiceInfo {
    meta: ServServiceMeta;
    decl: typeof ServService;
    impl: typeof ServService;
}

export interface ServServiceOptions {
    lazy?: boolean;
}

export type ServServiceReferPattern = 
    RegExp |
    string |
    ((service: string) => boolean) |
    Array<RegExp | string | ((service: string) => boolean)>;

export type ServServiceOnEmitListener = (service: string, event: string, args: any) => void;

export class ServServiceRefer {
    protected pattern: ServServiceReferPattern;
    protected manager: ServServiceManager ;
    onEvnterEmit?: ServServiceOnEmitListener;

    constructor(manager: ServServiceManager, pattern: ServServiceReferPattern) {
        this.manager = manager;
        this.pattern = pattern;

        this.manager.onReferAttach(this);
    }

    canRefer(service: string): boolean {
        if (!this.pattern || !this.manager) {
            return false;
        }

        if (Array.isArray(this.pattern)) {
            const ptns = this.pattern;
            let type: string;
            let ptn: ServServiceReferPattern;
            for (let i = 0, iz = ptns.length; i < iz; ++i) {
                ptn = ptns[i];
                type = typeof ptn;
                if (type === 'function' && (ptn as Function)(service)) {
                    return true;
                } else if (type === 'string' && ptn === service) {
                    return true;
                } else if (ptn instanceof RegExp && ptn.test(service)) {
                    return true;
                }
            }
        } else {
            const ptn = this.pattern;
            const type = typeof ptn;

            if (type === 'function' && (ptn as Function)(service)) {
                return true;
            } else if (type === 'string' && ptn === service) {
                return true;
            } else if (ptn instanceof RegExp && ptn.test(service)) {
                return true;
            }
        }

        return false;
    }

    getServiceByID<T extends ServService>(id: string): T | undefined {
        if (!this.canRefer(id)) {
            return;
        }

        return this.manager.getServiceByID(id) as T;
    }

    getService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined {
        const meta = util.meta(decl);
        if (!meta) {
            return;
        }

        return this.getServiceByID<InstanceType<T>>(meta.id);
    }

    rawEmit(service: string, event: string, args: any): void {
        if (!this.canRefer(service)) {
            return;
        }
        this.manager.rawEmit(service, event, args);
    }

    setPattern(pattern: ServServiceReferPattern) {
        this.pattern = pattern;
    }

    detach() {
        this.manager.onReferDetach(this);

        this.pattern = undefined!;
        this.manager = undefined!;
        this.onEvnterEmit = undefined;
    }

    _onEventerEmit(service: string, event: string, args: any) {
        if (!this.onEvnterEmit || !this.canRefer(service)) {
            return;
        }
        this.onEvnterEmit(service, event, args);
    }
}

export interface ServServiceConfig {
    services?: Array<{
        decl: typeof ServService;
        impl: typeof ServService;
        options?: ServServiceOptions;
    }>;
}

export class ServServiceManager {
    protected eventerManager: ServEventerManager;
    protected services: { [key: string]: ServService };
    protected serviceInfos: { [key: string]: ServServiceInfo };
    protected refers: ServServiceRefer[];
    onEvnterEmit?: ServServiceOnEmitListener;

    init(config?: ServServiceConfig) {
        this.services = {};
        this.serviceInfos = {};

        this.eventerManager = new ServEventerManager();
        this.eventerManager.init(this._onEventerEmit);

        this.refers = [];

        if (config && config.services) {
            this.addServices(config.services);
        }
    }

    release() {
        this.onEvnterEmit = undefined;
        this.refers.forEach((item) => {
            item.detach();
        });
        this.refers = [];
        this.eventerManager.release();
        this.services = {};
        this.serviceInfos = {};
    }

    getServiceByID<T extends ServService>(id: string): T | undefined {
        const service = this.services[id];
        if (service) {
            return service as T;
        }

        const info = this.serviceInfos[id];
        if (!info) {
            return undefined!;
        }

        return this.getService(info.decl) as T;
    }

    getService<T extends ConstructorOf<any>>(decl: T): InstanceType<T> | undefined {
        const metas = util.meta(decl);
        if (!metas) {
            return;
        }

        const id = metas.id;
        let service = this.services[id];
        if (!service) {
            const info = this.serviceInfos[id];
            if (!info) {
                return;
            }
            service = this.generateService(info);
            this.services[id] = service;
        }

        return service as InstanceType<T>;
    }

    serviceExecByID<T extends ServService, R>(id: string, exec: ((service: T) => R)): R | null {
        const service = this.getServiceByID<T>(id);
        if (!service) {
            return null;
        }

        return exec(service);
    }

    serviceExec<T extends ConstructorOf<any>, R>(decl: T, exec: ((service: InstanceType<T>) => R)): R | null {
        const service = this.getService(decl);
        if (!service) {
            return null;
        }

        return exec(service);
    }

    addService<D extends typeof ServService, I extends D>(decl: D, impl: I, options?: ServServiceOptions): boolean {
        const meta = util.meta(decl);
        if (!meta) {
            return false;
        }

        if (util.meta(impl) !== meta) {
            return false;
        }

        let info = this.serviceInfos[meta.id];
        if (info) {
            return false;
        }

        info = {
            meta,
            decl,
            impl,
        };

        this.serviceInfos[meta.id] = info;

        const lazy = (options && options.lazy) === true || false;
        if (!lazy) {
            const service = this.generateService(info);
            this.services[meta.id] = service;
        }

        return true;
    }

    addServices(
        items: Array<{ decl: typeof ServService, impl: typeof ServService, options?: ServServiceOptions }>,
        options?: ServServiceOptions,
    ): void {
        items.forEach((item) => {
            let opts = options;
            if (item.options) {
                opts = opts ? Object.assign({}, options, item.options) : item.options;
            }
            this.addService(item.decl, item.impl, opts);
        });
    }

    remService(decl: typeof ServService): boolean {
        const meta = util.meta(decl);
        if (!meta) {
            return false;
        }
        const info = this.serviceInfos[meta.id];
        if (!info) {
            return false;
        }

        delete this.serviceInfos[meta.id];
        delete this.services[meta.id];

        return true;
    }

    remServices(decls: Array<typeof ServService>): void {
        decls.forEach((item) => {
            this.remService(item);
        });
    }

    referServices(pattern: ServServiceReferPattern) {
        const refer = new ServServiceRefer(this, pattern);
        return refer;
    }

    rawEmit(service: string, event: string, args: any): void {
        this.eventerManager.rawEmit(service, event, args);
    }

    private generateService(info: ServServiceInfo): ServService {
        const obj = new info.impl();
        info.meta.evts.forEach((item) => {
            (obj as any)[item.name] = this.generateServiceEvent(info.meta.id, item.name);
        });

        const implMeta = util.implMeta(info.impl);
        if (implMeta) {
            const keys = Object.keys(implMeta.injects);
            for (let i = 0, iz = keys.length; i < iz; ++i) {
                const injInfo = implMeta.injects[keys[i]];
                if (injInfo.type === EServImplInject.GET_SERVICE) {
                    (obj as any)[injInfo.name] = this.injGetService;
                }
            }
        }

        return obj;
    }

    private injGetService = (decl: typeof ServService): ServService | undefined => {
        return this.getService(decl);
    }

    private generateServiceEvent(service: string, event: string) {
        return this.eventerManager.spawn(service, event);
    }

    private _onEventerEmit: ServEventerOnEmitListener = (eventer, args) => {
        if (this.onEvnterEmit) {
            try {
                this.onEvnterEmit(eventer.service, eventer.event, args);
            } catch (e) {
                asyncThrow(e);
            }
        }

        const refers = this.refers;
        for (let i = 0, iz = refers.length; i < iz; ++i) {
            try {
                refers[i]._onEventerEmit(eventer.service, eventer.event, args);
            } catch (e) {
                asyncThrow(e);
            }
        }

        return Promise.resolve();
    }

    onReferAttach(refer: ServServiceRefer) {
        const i = this.refers.indexOf(refer);
        if (i < 0) {
            this.refers.push(refer);
        }
    }

    onReferDetach(refer: ServServiceRefer) {
        const i = this.refers.indexOf(refer);
        if (i >= 0) {
            this.refers.splice(i, 1);
        }
    }
}
