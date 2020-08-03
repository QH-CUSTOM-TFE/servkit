import { asyncThrow } from '../../common/index';
import { ServSession, EServSession, ServSessionPackage } from '../ServSession';

export enum EServChannel {
    WINDOW = 1,
    MESSAGE,
    EVENT,
}

// tslint:disable-next-line:no-empty-interface
export interface ServChannelConfig {
    ignoreSenderType?: boolean;
}

export interface ServChannelObjectPackage {
    __mark__: string;
    data: ServSessionPackage;
}

export type ServChannelPackage = string | ServChannelObjectPackage;

export abstract class ServChannel {
    protected session: ServSession;
    protected config: ServChannelConfig;
    protected sendMark: string;
    protected recvMark: string;
    protected recvable: boolean;
    protected sendable: boolean;
    protected sendStringMark: string;
    protected recvStringMark: string;

    init(session: ServSession, config?: ServChannelConfig) {
        this.session = session;
        this.config = config || {};
        const sessionMark = `$$${session.getID()}$$`;

        if (this.config.ignoreSenderType) {
            this.sendMark = '';
            this.recvMark = '';
        } else {
            if (session.isMaster()) {
                this.sendMark = `$$${EServSession.MASTER}$$`;
                this.recvMark = `$$${EServSession.SLAVE}$$`;
            } else {
                this.sendMark = `$$${EServSession.SLAVE}$$`;
                this.recvMark = `$$${EServSession.MASTER}$$`;
            }
        }

        this.sendStringMark = sessionMark + this.sendMark;
        this.recvStringMark = sessionMark + this.recvMark;

        this.recvable = false;
        this.sendable = false;
    }

    release() {
        this.close();

        this.session = undefined!;
        this.config = undefined!;
        this.recvable = false;
        this.sendable = false;
    }

    isRecvable() {
        return this.recvable;
    }

    isSendable() {
        return this.sendable;
    }

    isOpened() {
        return this.recvable && this.sendable;
    }

    send(msg: ServSessionPackage) {
        if (!this.sendable) {
            return false;
        }

        let chnMsg: ServChannelPackage = this.toObjectPackage(msg);
        if (!chnMsg) {
            return false;
        }

        try {
            // Try send object message
            if (this.sendChannelPackage(chnMsg)) {
                return true;
            }
        } catch (e) {
            asyncThrow(e);
        }

        // Try send string message
        chnMsg = this.toStringPackage(msg);
        if (chnMsg) {
            try {
                if (this.sendChannelPackage(chnMsg)) {
                    return true;
                }
            } catch (e) {
                asyncThrow(e);
            }
        }
        return false;
    }

    abstract open(): Promise<void>;
    abstract close(): void;

    protected toObjectPackage(data: ServSessionPackage): ServChannelObjectPackage {
        return {
            __mark__: this.sendStringMark,
            data,
        };
    }

    protected toStringPackage(data: ServSessionPackage): string {
        try {
            const rawData = JSON.stringify(data);
            return this.sendStringMark + rawData;
        } catch (e) {
            return '';
        }
    }

    protected frObjectPackage(data: ServChannelObjectPackage): ServSessionPackage | undefined {
        if (data.__mark__ !== this.recvStringMark) {
            return;
        }

        return data.data;
    }

    protected frStringPackage(data: string): ServSessionPackage | undefined {
        if (!data.startsWith(this.recvStringMark)) {
            return;
        }

        data = data.substr(this.recvStringMark.length);
        return data ? JSON.parse(data) : data;
    }

    protected frChannelPackage(rawData: ServChannelPackage): ServSessionPackage | undefined {
        try {
            if (rawData === undefined || rawData === null) {
                return;
            }
            const type = typeof rawData;
            if (type === 'object') {
                return this.frObjectPackage(rawData as ServChannelObjectPackage);
            } else if (type === 'string') {
                return this.frStringPackage(rawData as string);
            }
        } catch (e) {
            asyncThrow(e);
        }
    }

    protected abstract sendChannelPackage(msg: ServChannelPackage): boolean;

    protected canRecvChannelPackage(msg: ServChannelPackage): boolean {
        return true;
    }

    protected recvChannelPackage(msg: ServChannelPackage): void {
        if (!this.recvable) {
            return;
        }

        if (!this.canRecvChannelPackage(msg)) {
            return;
        }

        const data = this.frChannelPackage(msg);
        if (data === undefined) {
            return;
        }
        this.session.recvPackage(data);
    }
}
