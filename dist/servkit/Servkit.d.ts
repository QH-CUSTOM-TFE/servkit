import { ServTerminal, ServTerminalConfig } from '../terminal/ServTerminal';
import { ServGlobalServiceConfig, ServGlobalServiceManager } from './ServGlobalServiceManager';
export interface ServkitConfig {
    service?: ServGlobalServiceConfig;
}
export declare class Servkit {
    namespace: string;
    service: ServGlobalServiceManager;
    protected terminals: ServTerminal[];
    constructor(namespace?: string);
    init(config?: ServkitConfig): void;
    release(): void;
    createTerminal(config: ServTerminalConfig): ServTerminal;
    destroyTerminal(terminal: ServTerminal): void;
    onTerminalInit(terminal: ServTerminal): void;
    onTerminalRelease(terminal: ServTerminal): void;
}
export declare const servkit: Servkit;
