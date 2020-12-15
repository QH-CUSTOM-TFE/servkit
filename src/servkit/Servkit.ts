import { asyncThrow } from '../common/index';
import { ServServiceClient, ServServiceClientConfig, ServServiceServer, ServServiceServerConfig } from '../service';
import { EServChannel } from '../session';
import { ServTerminal, ServTerminalConfig, EServTerminal } from '../terminal/ServTerminal';
import { ServGlobalServiceConfig, ServGlobalServiceManager } from './ServGlobalServiceManager';

export interface ServkitConfig {
    service?: ServGlobalServiceConfig;
    server?: ServServiceServerConfig;
    client?: ServServiceClientConfig;
}

export class Servkit  {
    namespace: string;

    service: ServGlobalServiceManager;

    server: ServServiceServer;
    client: ServServiceClient;

    protected terminals: ServTerminal[];

    constructor(namespace?: string) {
        this.namespace = namespace || '';
    }

    init(config?: ServkitConfig) {
        config = config || {};
        
        this.terminals = [];
        
        this.service = new ServGlobalServiceManager();
        this.service.init(config && config.service);

        this.initGlobalTerminals(config);
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

    protected initGlobalTerminals(config: ServkitConfig) {
        const id = 'com.servkit.global.' + parseInt((Math.random() * 10000) + '', 10) + Date.now();

        const serverTerminal = this.createTerminal({
            id,
            type: EServTerminal.MASTER, 
            session: {
                channel: {
                    type: EServChannel.EVENT,
                },
            },
            server: {
                ...config.server,
                serviceRefer: /.*/,
            },
        });

        const clientTerminal = this.createTerminal({
            id,
            type: EServTerminal.SLAVE,
                
            session: {
                channel: {
                    type: EServChannel.EVENT,
                },
            },
            client: config.client,
        });

        serverTerminal.openSession();
        clientTerminal.openSession();

        this.server = serverTerminal.server;
        this.client = clientTerminal.client;
    }
}

export const servkit = new Servkit();
try {
    servkit.init();
} catch (e) {
    asyncThrow(e);
}
