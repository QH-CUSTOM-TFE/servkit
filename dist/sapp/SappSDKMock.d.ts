import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { SappShowParams, SappHideParams, SappCloseResult } from './service/m/SappLifecycle';
import { ServServiceServerConfig, ServServiceServer } from '../service/ServServiceServer';
import { ServServiceClientConfig, ServServiceClient } from '../service/ServServiceClient';
import { AsyncMutex } from '../common/AsyncMutex';
import { Deferred } from '../common/Deferred';
import { SappSDK } from './SappSDK';
export interface SappSDKMockConfig {
    hideOnStart?: boolean;
    beforeStart?(): Promise<void>;
    resolveStartData?(): Promise<any> | any;
    resolveStartShowData?(): Promise<any> | any;
    resolveServiceServerConfig?(): Promise<ServServiceServerConfig> | ServServiceServerConfig;
    resolveServiceClientConfig?(): Promise<ServServiceClientConfig> | ServServiceClientConfig;
    afterStart?(): Promise<void>;
}
export declare class SappSDKMock {
    static ENABLE_MARK: string;
    static isMockEnabled(): boolean;
    protected sdk: SappSDK;
    protected isStarted: boolean;
    protected config: SappSDKMockConfig;
    protected terminal: ServTerminal;
    protected mutex: AsyncMutex;
    protected showHideMutex: AsyncMutex;
    protected waitOnStart?: Deferred;
    constructor(sdk: SappSDK);
    setConfig(config: SappSDKMockConfig): this;
    getConfig(): SappSDKMockConfig;
    start(): Promise<void>;
    protected initTerminal(): Promise<void>;
    fixSlaveTerminalConfig(config: ServTerminalConfig): void;
    protected resolveStartData(): Promise<any>;
    protected resolveStartShowData(): Promise<any>;
    show(params?: SappShowParams): Promise<void>;
    hide(params?: SappHideParams): Promise<void>;
    protected _show: ((params?: SappShowParams | undefined, byCreate?: boolean | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    protected _hide: ((params?: SappHideParams | undefined, byClose?: boolean | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    close: ((result?: SappCloseResult | undefined) => Promise<void>) & {
        deferred: Deferred<void> | undefined;
    };
    getService: ServServiceClient['getService'];
    getServiceUnsafe: ServServiceClient['getServiceUnsafe'];
    service: ServServiceClient['service'];
    serviceExec: ServServiceClient['serviceExec'];
    getServerService: ServServiceServer['getService'];
    getServerServiceUnsafe: ServServiceServer['getServiceUnsafe'];
    serverService: ServServiceServer['service'];
    serverServiceExec: ServServiceServer['serviceExec'];
    protected beforeStart(): Promise<void>;
    protected afterStart(): Promise<void>;
    protected onSessionBroken(): void;
}
