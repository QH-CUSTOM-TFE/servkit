import { EServMessage, ServMessage, ServMessageCreator } from '../message';
import { ServSession } from './ServSession';

export interface ServSessionCheckerStartOptions {
    interval?: number;
    tryCount?: number;
    onBroken?: (session: ServSession) => void;
}

const DEFAULT_OPTIONS: ServSessionCheckerStartOptions = {
    interval: 10000,
    tryCount: 3,
};

export class ServSessionChecker {
    protected session: ServSession;
    protected options: ServSessionCheckerStartOptions;
    protected isStarted: boolean;
    protected timer: number;
    protected latestEchoTime: number;
    protected lastCheckEchoTime: number;
    protected checkCount: number;
    protected unlisten?: (() => void);

    constructor(session: ServSession) {
        this.session = session;
        this.resetCheckData();
    }

    start(options?: ServSessionCheckerStartOptions) {
        if (this.isStarted) {
            this.stop();
        }

        this.isStarted = true;
        this.resetCheckData();

        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.options.tryCount = Math.max(1, this.options.tryCount!);
        this.options.interval = Math.max(5000, this.options.interval!);
    }

    startChecking() {
        if (!this.isStarted) {
            return;
        }
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(this.onCheck, this.options.interval) as any;
        if (!this.session.isMaster()) {
            this.onCheck();
        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }

        if (this.unlisten) {
            this.unlisten();
            this.unlisten = undefined;
        }

        this.resetCheckData();
        this.isStarted = false;
    }

    protected onCheck = () => {
        if (this.session.isMaster()) {
            if (this.lastCheckEchoTime !== this.latestEchoTime) {
                this.checkCount = 0;
                this.lastCheckEchoTime = this.latestEchoTime;
            } else {
                ++this.checkCount;
                if (this.checkCount >= this.options.tryCount!) {
                    this.stop();
                    if (this.options.onBroken) {
                        this.options.onBroken(this.session);
                    }
                }
            }
        } else {
            this.session.sendMessage(ServMessageCreator.create(EServMessage.SESSION_HEARTBREAK));
        }
    }

    handleEchoMessage(msg: ServMessage): boolean {
        if (!this.isStarted) {
            return true;
        }

        this.latestEchoTime = Date.now();
        this.checkCount = 0;

        return true;
    }

    protected resetCheckData() {
        this.checkCount = 0;
        this.latestEchoTime = -1;
        this.lastCheckEchoTime = -2;
    }
}
