import { Sapp, SappInfo } from './Sapp';
import { SappController } from './SappController';
import { Servkit } from '../servkit/Servkit';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { ServGlobalServiceManager } from '../servkit/ServGlobalServiceManager';
import { ServServiceConfig, ServServiceReferPattern } from '../service/ServServiceManager';
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
    services?: ServServiceConfig['services'];
    serviceRefer?: ServServiceReferPattern;
    startTimeout?: number;
    useTerminalId?: string;
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
    preload(id: string | SappInfo): Promise<void>;
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
