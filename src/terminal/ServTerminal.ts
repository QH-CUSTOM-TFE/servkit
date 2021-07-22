import { ServServiceClient, ServServiceClientConfig } from '../service/ServServiceClient';
import { ServServiceServer, ServServiceServerConfig } from '../service/ServServiceServer';
import { Servkit } from '../servkit/Servkit';
import { ServSession, ServSessionConfig, ServSessionOpenOptions } from '../session/ServSession';

export enum EServTerminal {
    NULL = 0,
    MASTER,
    SLAVE,
}

export interface ServTerminalConfig {
    id: string;
    type: EServTerminal;

    client?: ServServiceClientConfig;
    server?: ServServiceServerConfig;
    session: ServSessionConfig;
}

export class ServTerminal  {
    id: string;
    type: EServTerminal;

    servkit: Servkit;

    client: ServServiceClient;
    server: ServServiceServer;
    session: ServSession;

    protected extData: any;

    constructor(servkit: Servkit) {
        this.servkit = servkit;
    }

    init(config: ServTerminalConfig) {
        this.id = config.id;
        this.type = config.type;

        this.session = new ServSession(this);
        this.server = new ServServiceServer(this);
        this.client = new ServServiceClient(this);

        this.session.init(config.session);
        this.server.init(config.server);
        this.client.init(config.client);
    }

    isMaster() {
        return this.type === EServTerminal.MASTER;
    }

    release() {
        this.client.release();
        this.server.release();
        this.session.release();

        delete this.extData;
    }

    setExtData<T = any>(data: T) {
        this.extData = data;
    }

    getExtData<T = any>(): T {
        return this.extData;
    }

    openSession(options?: ServSessionOpenOptions) {
        return this.session.open(options);
    }

    closeSession() {
        return this.session.close();
    }
}
