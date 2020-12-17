import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { Servkit } from '../servkit/Servkit';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { ServGlobalServiceManager } from '../servkit/ServGlobalServiceManager';
export declare enum ESappCreatePolicy {
    NONE = 0,
    SINGLETON = 1,
    INFINITE = 2
}
export declare enum ESappLifePolicy {
    NONE = 0,
    AUTO = 1,
    MANUAL = 2
}
export declare enum ESappType {
    IFRAME = "iframe"
}
export declare class SappInfo {
    id: string;
    version: string;
    name: string;
    desc?: string;
    type?: ESappType;
    url: string;
    options: {
        create?: ESappCreatePolicy;
        life?: ESappLifePolicy;
        lifeMaxHideTime?: number;
        dontStartOnCreate?: boolean;
        layout?: string;
        isPlainPage?: boolean;
    };
}
export declare class SappLayoutOptions {
    container?: string | HTMLElement;
    className?: string;
    style?: Partial<HTMLElement['style']>;
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
}
export interface SappCreateOptions {
    dontStartOnCreate?: boolean;
    createAppController?(mgr: SappMGR, app: Sapp): SappController;
    layout?: SappLayoutOptions | ((app: Sapp) => SappLayoutOptions);
    startData?: any | ((app: Sapp) => any);
    startShowData?: any | ((app: Sapp) => any);
}
export interface SappMGRConfig {
    servkit?: Servkit;
    createAppController?(mgr: SappMGR, app: Sapp): SappController;
    loadAppInfo?(mgr: SappMGR, id: string): Promise<SappInfo | undefined>;
}
export declare class SappMGR {
    protected infos: {
        [key: string]: SappInfo;
    };
    protected apps: {
        [key: string]: Sapp[];
    };
    protected nextId: number;
    protected config: SappMGRConfig;
    constructor();
    setConfig(config: SappMGRConfig): this;
    getServkit(): Servkit;
    getService: ServGlobalServiceManager['getService'];
    getServiceUnsafe: ServGlobalServiceManager['getServiceUnsafe'];
    service: ServGlobalServiceManager['service'];
    serviceExec: ServGlobalServiceManager['serviceExec'];
    addServices: ServGlobalServiceManager['addServices'];
    remServices: ServGlobalServiceManager['remServices'];
    getConfig(): SappMGRConfig;
    getApp(id: string): Sapp;
    getApps(id: string): Sapp[];
    getAppInfo(id: string): SappInfo;
    addAppInfo(info: SappInfo): boolean;
    remAppInfo(id: string): boolean;
    loadAppInfo(id: string): Promise<SappInfo | undefined>;
    create(id: string | SappInfo, options?: SappCreateOptions): Promise<Sapp>;
    show(id: string, params?: SappShowParams): Promise<Sapp>;
    hide(id: string, params?: SappHideParams): Promise<Sapp>;
    close(id: string, result?: SappCloseResult): Promise<Sapp>;
    createOrShow(id: string, options?: SappCreateOptions): Promise<Sapp>;
    protected addApp(app: Sapp): boolean;
    protected remApp(app: Sapp): boolean;
    protected nextAppUuid(info: SappInfo): string;
    protected createApp(uuid: string, info: SappInfo, options: SappCreateOptions): Sapp;
    protected createAppController(app: Sapp, options: SappCreateOptions): SappController;
    protected createDefaultAppController(app: Sapp): SappController;
}
export declare const sappMGR: SappMGR;
