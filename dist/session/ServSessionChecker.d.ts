import { ServMessage } from '../message';
import { ServSession } from './ServSession';
export interface ServSessionCheckerStartOptions {
    interval?: number;
    tryCount?: number;
    onBroken?: (session: ServSession) => void;
}
export declare class ServSessionChecker {
    protected session: ServSession;
    protected options: ServSessionCheckerStartOptions;
    protected isStarted: boolean;
    protected timer: number;
    protected latestEchoTime: number;
    protected lastCheckEchoTime: number;
    protected checkCount: number;
    protected unlisten?: (() => void);
    constructor(session: ServSession);
    start(options?: ServSessionCheckerStartOptions): void;
    startChecking(): void;
    stop(): void;
    protected onCheck: () => void;
    handleEchoMessage(msg: ServMessage): boolean;
    protected resetCheckData(): void;
}
