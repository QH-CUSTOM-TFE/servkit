import { ServServiceClient, ServServiceClientConfig } from '../service/ServServiceClient';
import { ServServiceServer, ServServiceServerConfig } from '../service/ServServiceServer';
import { Servkit } from '../servkit/Servkit';
import { ServSession, ServSessionConfig, ServSessionOpenOptions } from '../session/ServSession';
export declare enum EServTerminal {
    NULL = 0,
    MASTER = 1,
    SLAVE = 2
}
export interface ServTerminalConfig {
    id: string;
    type: EServTerminal;
    client?: ServServiceClientConfig;
    server?: ServServiceServerConfig;
    session: ServSessionConfig;
}
export declare class ServTerminal {
    id: string;
    type: EServTerminal;
    servkit: Servkit;
    client: ServServiceClient;
    server: ServServiceServer;
    session: ServSession;
    constructor(servkit: Servkit);
    init(config: ServTerminalConfig): void;
    isMaster(): boolean;
    release(): void;
    openSession(options?: ServSessionOpenOptions): Promise<void>;
    closeSession(): void;
}
