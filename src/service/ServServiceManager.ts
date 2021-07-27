import { asyncThrow, asyncThrowMessage } from '../common/common';
import { ServEventerManager, ServEventerOnEmitListener } from './event/ServEventerManager';
import { ServService, ServServiceMeta } from './ServService';

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

    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined {
        const meta = decl.meta();
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
    protected serviceInjects?: {
        getService: ServServiceManager['getService'];
        getServiceUnsafe: ServServiceManager['getServiceUnsafe'];
        service: ServServiceManager['service'];
        serviceExec: ServServiceManager['serviceExec'];
        getServiceByID: ServServiceManager['getServiceByID'];
        serviceExecByID: ServServiceManager['serviceExecByID'];
    };
    
    onEvnterEmit?: ServServiceOnEmitListener;

    init(config?: ServServiceConfig) {
        this.services = {};
        this.serviceInfos = {};
        const self = this;
        this.serviceInjects = {
            // tslint:disable-next-line:object-literal-shorthand
            getService: function() {
                return self.getService.apply(self, arguments);
            },
            // tslint:disable-next-line:object-literal-shorthand
            getServiceUnsafe: function() {
                return self.getServiceUnsafe.apply(self, arguments);
            },
            // tslint:disable-next-line:object-literal-shorthand
            service: function() {
                return self.service.apply(self, arguments);
            },
            // tslint:disable-next-line:object-literal-shorthand
            serviceExec: function() {
                return self.serviceExec.apply(self, arguments);
            },
            // tslint:disable-next-line:object-literal-shorthand
            getServiceByID: function() {
                return self.getServiceByID.apply(self, arguments);
            },
            // tslint:disable-next-line:object-literal-shorthand
            serviceExecByID: function() {
                return self.serviceExecByID.apply(self, arguments);
            },
        };

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
        this.serviceInjects = undefined;
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

        return this._getService(info.decl) as T;
    }

    protected _getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined {
        const metas = decl.meta();
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

    getService<T extends typeof ServService>(decl: T): InstanceType<T> | undefined;
    getService<M extends { [key: string]: typeof ServService }>(decls: M)
        : { [key in keyof M]: InstanceType<M[key]> | undefined };
    getService() {
        if (arguments.length === 0) {
            return;
        }

        const decls = arguments[0];
        if (typeof decls === 'function') {
            return this._getService(decls);
        } else {
            const keys = Object.keys(decls);
            const services = {};
            for (let i = 0, iz = keys.length; i < iz; ++i) {
                services[keys[i]] = this._getService(decls[keys[i]]);
            }
            
            return services;
        }
    }

    getServiceUnsafe<T extends typeof ServService>(decl: T): InstanceType<T>;
    getServiceUnsafe<M extends { [key: string]: typeof ServService }>(decls: M)
        : { [key in keyof M]: InstanceType<M[key]> };
    getServiceUnsafe() {
        return this.getService.apply(this, arguments);
    }

    service<T extends typeof ServService>(decl: T): Promise<InstanceType<T>>;
    service<M extends { [key: string]: typeof ServService }>(decls: M)
        : Promise<{ [key in keyof M]: InstanceType<M[key]> }>;
    service() {
        if (arguments.length === 0) {
            return Promise.reject(new Error('[SERVKIT] Decl is empty'));
        }

        const services = this.serviceExec(arguments[0], (v) => {
            return v;
        });

        return services ? Promise.resolve(services) : Promise.reject(new Error('[SAPPSDK] Get a undefined service'));
    }

    serviceExec<
        T extends typeof ServService,
        R>(
        decl: T,
        exec: ((service: InstanceType<T>) => R));
    serviceExec<
        M extends { [key: string]: typeof ServService },
        R>(
        decls: M,
        exec: ((services: { [key in keyof M]: InstanceType<M[key]> }) => R));
    serviceExec() {
        if (arguments.length < 2) {
            return null;
        }

        const decls = arguments[0];
        const exec = arguments[1];

        if (typeof decls === 'function') {
            const service = this._getService(decls);
            if (!service) {
                return null;
            }
    
            return exec(service);
        } else {
            const keys = Object.keys(decls);
            const services = {};
            for (let i = 0, iz = keys.length; i < iz; ++i) {
                const service = this._getService(decls[keys[i]]);
                if (!service) {
                    return null;
                }
                services[keys[i]] = service;
            }
            
            return exec.call(window, services);
        }
    }

    serviceExecByID<T extends ServService, R>(id: string, exec: ((service: T) => R)): R | null {
        const service = this.getServiceByID<T>(id);
        if (!service) {
            return null;
        }

        return exec(service);
    }

    addService<D extends typeof ServService, I extends D>(decl: D, impl: I, options?: ServServiceOptions): boolean {
        try {
            const meta = decl.meta();
            if (!meta) {
                asyncThrowMessage(`Service meta is undefined`);
                return false;
            }

            if (impl.meta() !== meta) {
                asyncThrowMessage(`${meta.id} impl meta is not equal to decl, Maybe you have mutiple decl npm package`);
                return false;
            }

            let info = this.serviceInfos[meta.id];
            if (info) {
                asyncThrowMessage(`${meta.id} has added`);
                
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
        } catch (e) {
            asyncThrow(e);
            return false;
        }
    }

    addServices(
        items: Array<{ decl: typeof ServService, impl: typeof ServService, options?: ServServiceOptions }>,
        options?: ServServiceOptions,
    ): void {
        try {
            items.forEach((item) => {
                let opts = options;
                if (item.options) {
                    opts = opts ? Object.assign({}, options, item.options) : item.options;
                }
                this.addService(item.decl, item.impl, opts);
            });
        } catch (e) {
            asyncThrow(e);
        }
    }

    remService(decl: typeof ServService): boolean {
        const meta = decl.meta();
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

        // Inject service apis
        if (this.serviceInjects) {
            const keys = Object.keys(this.serviceInjects);
            for (let i = 0, iz = keys.length; i < iz; ++i) {
                obj[keys[i]] = this.serviceInjects[keys[i]];
            }
        }

        return obj;
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
