import { asyncThrow, EServConstant, logSession } from '../common/common';
import { ServSessionCallMessageCreator } from '../message/creator';
import { ServMessageContextManager } from '../message/ServMessageContextManager';
import { EServMessage, ServMessage, ServSessionCallMessage, ServSessionCallReturnMessage } from '../message/type';
import { ServTerminal } from '../terminal/ServTerminal';
import { EServChannel, ServChannel, ServChannelConfig } from './channel/ServChannel';
import { ServEventChannel, ServEventChannelConfig } from './channel/ServEventChannel';
import { ServMessageChannel, ServMessageChannelConfig } from './channel/ServMessageChannel';
import { ServWindowChannel, ServWindowChannelConfig } from './channel/ServWindowChannel';
import { ServSessionChecker, ServSessionCheckerStartOptions } from './ServSessionChecker';
import { ServEventLoaderChannel } from './channel/ServEventLoaderChannel';
import { Deferred, DeferredUtil } from '../common/Deferred';

export enum EServSessionStatus {
    CLOSED = 0,
    OPENNING,
    OPENED,
}

export interface ServSessionCallOptions {
    timeout?: number;
}

export interface ServSessionConfig {
    checkSession?: boolean;
    checkOptions?: ServSessionCheckerStartOptions;
    channel: {
        type: EServChannel | typeof ServChannel;
        config?: ServChannelConfig | ServWindowChannelConfig | ServMessageChannelConfig | ServEventChannelConfig;
    };
}

export interface ServSessionOpenOptions {
    timeout?: number;
    waiting?: Promise<void>;
}

export type ServSessionPackage = ServMessage;

export interface ServSessionListener {
    onRecvData<T>(data: any): boolean;
}

export type ServSessionOnRecvMessageListener = (
    message: ServMessage,
    session: ServSession,
    terminal: ServTerminal,
) => boolean;

export type ServSessionOnRecvCallMessageListener = (
    type: string,
    args: any,
    doReturn: ((data?: any, error?: any) => void),
    session: ServSession,
    terminal: ServTerminal,
) => boolean;

interface PendingMessage {
    isSend?: boolean;
    sendDeferred?: Deferred;
    message: ServMessage;
}

export class ServSession {
    protected terminal: ServTerminal;
    protected status: EServSessionStatus;
    protected openningPromise?: Promise<void>;
    protected openningCancel?: (() => void);
    protected channel: ServChannel;
    protected onRecvListeners: ServSessionOnRecvMessageListener[];
    protected onRecvCallListeners: ServSessionOnRecvCallMessageListener[];
    protected messageContextManager: ServMessageContextManager;
    protected sessionChecker?: ServSessionChecker;
    protected sessionCheckOptions?: ServSessionCheckerStartOptions;
    protected pendingQueue: PendingMessage[];

    constructor(terminal: ServTerminal) {
        this.terminal = terminal;
        this.pendingQueue = [];
    }

    init(config: ServSessionConfig) {
        this.status = EServSessionStatus.CLOSED;
        this.onRecvListeners = [];
        this.onRecvCallListeners = [];
        this.initChannel(config.channel);
        this.messageContextManager = new ServMessageContextManager();
        this.messageContextManager.init();

        if (config.checkSession) {
            const options = config.checkOptions || {};
            this.sessionCheckOptions = options;
            this.sessionChecker = new ServSessionChecker(this);

            if (!options.onBroken) {
                options.onBroken = (session) => {
                    session.close();
                };
            }
        }
    }

    release() {
        this.close();
        this.messageContextManager.release();
        this.releaseChannel();
        this.onRecvListeners = [];
        this.onRecvCallListeners = [];
    }

    protected initChannel(config: ServSessionConfig['channel']) {
        const type2cls = {
            [EServChannel.WINDOW]: ServWindowChannel,
            [EServChannel.EVENT]: ServEventChannel,
            [EServChannel.MESSAGE]: ServMessageChannel,
            [EServChannel.EVENT_LOADER]: ServEventLoaderChannel,
        };
        const cls = typeof config.type === 'function' ? config.type : type2cls[config.type] ;
        if (!cls) {
            throw new Error('[SERVKIT] Unknown channel type');
        }

        this.channel = new (cls as any)();
        this.channel.init(this, config.config);
    }

    protected releaseChannel() {
        this.channel.release();
    }

    isMaster() {
        return this.terminal.isMaster();
    }

    getID() {
        return this.terminal.servkit.namespace
                ? this.terminal.servkit.namespace + '-' + this.terminal.id
                : this.terminal.id;
    }

    isOpened() {
        return this.status === EServSessionStatus.OPENED;
    }

    open(options?: ServSessionOpenOptions): Promise<void> {
        if (this.status > EServSessionStatus.CLOSED) {
            logSession(this, 'OPEN WHILE ' + (this.status === EServSessionStatus.OPENNING ? 'OPENNING' : 'OPENED') );
            return this.openningPromise || Promise.reject(new Error('unknown'));
        }

        this.status = EServSessionStatus.OPENNING;
        logSession(this, 'OPENNING');

        let done = false;
        let timer = 0;
        const doSafeWork = (work: any) => {
            if (done) {
                return;
            }
            done = true;
            this.openningCancel = undefined;
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
            work();
        };

        const timeout = (options && options.timeout) || EServConstant.SERV_SESSION_OPEN_TIMEOUT;
        const pTimeout = timeout > 0 ? new Promise<void>((resolve, reject) => {
            timer = setTimeout(() => {
                doSafeWork(() => {
                    logSession(this, 'OPENNING TIMEOUT');
                    reject(new Error('timeout'));
                    this.close();
                });
            }, timeout) as any;
        }) : undefined;

        let openPromise = this.channel.open({
            dontWaitSlaveEcho: !pTimeout,
        });
        if (options && options.waiting) {
            const waiting = options.waiting.catch(() => undefined);
            openPromise = Promise.all([openPromise, waiting]) as any as Promise<void>;
        }

        const p = openPromise.then(() => {
            doSafeWork(() => {
                logSession(this, 'OPENNED');
                this.status = EServSessionStatus.OPENED;
            });
        }, (e) => {
            doSafeWork(() => {
                logSession(this, 'OPENNING FAILED', e);
                this.status = EServSessionStatus.CLOSED;
            });
            return Promise.reject(e);
        });

        const pCancel = new Promise<void>((resolve, reject) => {
            this.openningCancel = () => {
                doSafeWork(() => {
                    logSession(this, 'OPENNING CANCELLED');
                    reject(new Error('cancel'));
                    this.close();
                });
            };
        });
        const promises = [p, pCancel];
        if (pTimeout) {
            promises.push(pTimeout);
        }
        this.openningPromise = Promise.race(promises);

        const sessionChecker = pTimeout ? this.sessionChecker : undefined;

        if (sessionChecker) {
            sessionChecker.start(this.sessionCheckOptions);
        }

        return this.openningPromise.then(() => {
            this.flushPendingQueue();

            if (sessionChecker) {
                sessionChecker.startChecking();
            }
        });
    }

    close() {
        if (this.status <= EServSessionStatus.CLOSED) {
            logSession(this, 'CLOSE WHILE CLOSED');
            return;
        }

        this.channel.close();
        logSession(this, 'CLOSED');
                    
        this.status = EServSessionStatus.CLOSED;
        
        this.flushPendingQueue();
        this.openningPromise = undefined;

        if (this.openningCancel) {
            this.openningCancel();
        }

        if (this.sessionChecker) {
            this.sessionChecker.stop();
        }
    }

    sendMessage(msg: ServMessage): Promise<void> {
        if (this.status !== EServSessionStatus.OPENED) {
            if (this.status === EServSessionStatus.OPENNING) {
                const pending = {
                    isSend: true,
                    message: msg,
                    sendDeferred: DeferredUtil.create(),
                };
                this.pendingQueue.push(pending);

                return pending.sendDeferred;
            }

            logSession(this, 'Send(NOOPEN)', msg);
            return Promise.reject(new Error('Session not opened'));
        }

        if (msg.$type !== EServMessage.SESSION_HEARTBREAK) {
            logSession(this, 'Send', msg);
        }
        
        // const pkg: ServSessionPackage = {
        //     $msg: msg,
        //     $sid: this.id,
        //     $stp: this.type,
        // };

        const ret = this.channel.send(msg);

        if (!ret) {
            return Promise.reject(new Error('Send failed'));
        }

        return Promise.resolve();
    }

    callMessage<T = any>(type: string, args?: any, options?: ServSessionCallOptions): Promise<T> {
        const message = ServSessionCallMessageCreator.create(type, args);
        let timeout: number = undefined!;
        if (options && options.timeout !== undefined) {
            timeout = options.timeout;
        } else {
            timeout = EServConstant.SERV_SESSION_CALL_MESSAGE_TIMEOUT;
        }
        const addOptions = {
            timeout,
            prewait: this.sendMessage(message),
        };

        let promise = this.messageContextManager.add(message, addOptions);
        if (!promise) {
            promise = this.messageContextManager.getPromise(message.$id);
        }

        if (!promise) {
            promise = Promise.reject(new Error('unknown'));
        }

        return promise;
    }

    protected handleReturnMessage(message: ServSessionCallReturnMessage): boolean {
        if (message.error) {
            return this.messageContextManager.failed(message.$id, message.error);
        } else {
            return this.messageContextManager.succeed(message.$id, message.data);
        }
    }

    recvPackage(pkg: ServSessionPackage): void {
        if (this.status !== EServSessionStatus.OPENED) {
            if (this.status === EServSessionStatus.OPENNING) {
                const pending = {
                    message: pkg,
                };
                this.pendingQueue.push(pending);
                return;
            }

            logSession(this, 'Recv(NOOPEN)', pkg);
            return;
        }

        if (!pkg || typeof pkg !== 'object') {
            logSession(this, 'Recv(INVALID)', pkg);
            return;
        }

        // if (pkg.$sid !== this.id) {
        //     return;
        // }

        // if (this.type === EServSession.MASTER && pkg.$stp !== EServSession.SLAVE) {
        //     return;
        // }

        // if (this.type === EServSession.SLAVE && pkg.$stp !== EServSession.MASTER) {
        //     return;
        // }

        this.dispatchMessage(pkg);
    }

    protected dispatchMessage(msg: ServMessage): void {
        if (this.sessionChecker && msg.$type === EServMessage.SESSION_HEARTBREAK) {
            this.sessionChecker.handleEchoMessage(msg);
            return;
        }

        logSession(this, 'Recv', msg);
        
        if (ServSessionCallMessageCreator.isCallReturnMessage(msg)) {
            this.handleReturnMessage(msg);
            return;
        }

        if (ServSessionCallMessageCreator.isCallMessage(msg)) {
            const callMsg = msg as ServSessionCallMessage;
            const doReturn = (data: any, error: any) => {
                this.sendMessage(ServSessionCallMessageCreator.createReturn(callMsg, data, error));
            };
            if (this.onRecvCallListeners.length !== 0) {
                const callListeners = this.onRecvCallListeners;
                for (let i = 0, iz = callListeners.length; i < iz; ++i) {
                    try {
                        if (callListeners[i](callMsg.type, callMsg.args, doReturn, this, this.terminal)) {
                            return;
                        }
                    } catch (e) {
                        asyncThrow(e);
                    }
                }
            } 
            
            doReturn(undefined, `Unknow call type [${callMsg.type}]`);
            return;
        }

        if (this.onRecvListeners.length !== 0) {
            const listeners = this.onRecvListeners;
            for (let i = 0, iz = listeners.length; i < iz; ++i) {
                try {
                    listeners[i](msg, this, this.terminal);
                } catch (e) {
                    asyncThrow(e);
                }
            }
        }
    }

    onRecvMessage(listener: ServSessionOnRecvMessageListener): () => void {
        const ret = () => {
            const i = this.onRecvListeners.indexOf(listener);
            if (i >= 0) {
                this.onRecvListeners.splice(i, 1);
            }
        };
        if (this.onRecvListeners.indexOf(listener) < 0) {
            this.onRecvListeners.push(listener);
        }

        return ret;
    }

    onRecvCallMessage(listener: ServSessionOnRecvCallMessageListener): () => void {
        const ret = () => {
            const i = this.onRecvCallListeners.indexOf(listener);
            if (i >= 0) {
                this.onRecvCallListeners.splice(i, 1);
            }
        };
        if (this.onRecvCallListeners.indexOf(listener) < 0) {
            this.onRecvCallListeners.push(listener);
        }

        return ret;
    }

    protected flushPendingQueue() {
        const pendingQueue = this.pendingQueue;
        this.pendingQueue = [];
        if (this.status === EServSessionStatus.CLOSED) {
            pendingQueue.forEach((item) => {
                if (item.isSend) {
                    item.sendDeferred!.reject(new Error('Session not opened'));
                }
            });
        } else if (this.status === EServSessionStatus.OPENED) {
            pendingQueue.forEach((item) => {
                if (item.isSend) {
                    this.sendMessage(item.message).then((data) => {
                        item.sendDeferred!.resolve(data);
                    }, (error) => {
                        item.sendDeferred!.reject(error);
                    });
                } else {
                    this.recvPackage(item.message);
                }
            });
        }
    }
}
