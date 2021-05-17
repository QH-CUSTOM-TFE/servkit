import { asyncThrow } from '../common/common';
import { ServServiceClient, ServServiceClientConfig, ServServiceServer, ServServiceServerConfig } from '../service';
import { EServChannel } from '../session';
import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServGlobalServiceConfig, ServGlobalServiceManager } from './ServGlobalServiceManager';

export interface ServkitConfig {
    service?: ServGlobalServiceConfig;
}

export class Servkit  {
    namespace: string;

    service: ServGlobalServiceManager;

    protected terminals: ServTerminal[];

    constructor(namespace?: string) {
        this.namespace = namespace || '';
    }

    init(config?: ServkitConfig) {
        config = config || {};
        
        this.terminals = [];
        
        this.service = new ServGlobalServiceManager();
        this.service.init(config && config.service);
    }

    release() {
        const terminals = this.terminals;
        this.terminals = [];

        terminals.forEach((item) => {
            item.release();
        });

        this.service.release();
    }

    createTerminal(config: ServTerminalConfig) {
        if (this.terminals.some((item) => {
            return item.id === config.id && item.type === config.type;
        })) {
            throw new Error(`[SERVKIT] Terminal [${config.id}:${config.type}] conflicts.`);
        }

        const terminal = new ServTerminal(this);
        terminal.init(config);

        return terminal;
    }

    destroyTerminal(terminal: ServTerminal) {
        terminal.release();
    }

    onTerminalInit(terminal: ServTerminal) {
        this.terminals.push(terminal);
    }

    onTerminalRelease(terminal: ServTerminal) {
        const i = this.terminals.indexOf(terminal);
        if (i >= 0) {
            this.terminals.splice(i, 1);
        }
    }
}

let sInstance: Servkit = undefined!;
try {
    sInstance = new Servkit();
    sInstance.init();
} catch (e) {
    asyncThrow(e);
}

export const servkit = sInstance;
