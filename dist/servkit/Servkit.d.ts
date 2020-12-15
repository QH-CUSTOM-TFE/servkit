import { ServServiceClient, ServServiceClientConfig, ServServiceServer, ServServiceServerConfig } from '../service';
import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServGlobalServiceConfig, ServGlobalServiceManager } from './ServGlobalServiceManager';
export interface ServkitConfig {
    service?: ServGlobalServiceConfig;
    server?: ServServiceServerConfig;
    client?: ServServiceClientConfig;
}
export declare class Servkit {
    namespace: string;
    service: ServGlobalServiceManager;
    server: ServServiceServer;
    client: ServServiceClient;
    protected terminals: ServTerminal[];
    constructor(namespace?: string);
    init(config?: ServkitConfig): void;
    release(): void;
    createTerminal(config: ServTerminalConfig): ServTerminal;
    destroyTerminal(terminal: ServTerminal): void;
    onTerminalInit(terminal: ServTerminal): void;
    onTerminalRelease(terminal: ServTerminal): void;
    protected initGlobalTerminals(config: ServkitConfig): void;
}
export declare const servkit: Servkit;
