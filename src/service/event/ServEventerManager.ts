import { EventEmitter } from 'eventemitter3';
import { ServEventer, ServEventListener, ServEventUnListener } from '../ServService';

const DUMMY_UNLISTENER: ServEventUnListener = () => undefined;

class Eventer implements ServEventer {
    static generateRawEvent(service: string, event: string) {
        return `SERVKIT#${service}#${event}`;
    }

    service: string;
    event: string;

    protected rawEvent: string;
    protected _unlisteners?: ServEventUnListener[];

    protected center?: EventEmitter;

    constructor(service: string, event: string) {
        this.service = service;
        this.event = event;
        this.rawEvent = Eventer.generateRawEvent(service, event);
    }

    on(listener: ServEventListener): ServEventUnListener {
        const unlistener = this.generateUnlitener(listener);
        if (this.center) {
            this.center.on(this.rawEvent, listener);
        }

        return unlistener;
    }

    once(listener: ServEventListener): ServEventUnListener {
        const old = listener;
        let unlistener: ServEventUnListener = undefined!;
        listener = function() {
            old.apply(this, arguments);
            if (unlistener) {
                unlistener();
            }
        };

        unlistener = this.generateUnlitener(listener);
        if (this.center) {
            this.center.once(this.rawEvent, listener);
        }

        return unlistener;
    }

    emit(args: any): Promise<void> {
        if (!this.center) {
            return Promise.reject(new Error('unknown'));
        }

        return Promise.resolve(this.center.emit(this.rawEvent, this, args) as any);
    }

    attach(center: EventEmitter) {
        if (this.center !== center) {
            this.detach();
            this.center = center;
        }
    }

    detach() {
        if (this._unlisteners) {
            this._unlisteners.forEach((item) => {
                item();
            });
            this._unlisteners = undefined;
        }
        this.center = undefined;
    }

    protected generateUnlitener(listener: ServEventListener): ServEventUnListener {
        let unlistener = DUMMY_UNLISTENER;
        if (this.center) {
            unlistener = () => {
                if (this._unlisteners) {
                    const i = this._unlisteners.indexOf(unlistener);
                    if (i >= 0) {
                        this._unlisteners.splice(i, 1);
                    }
                }

                if (this.center) {
                    this.center.off(this.rawEvent, listener);
                }
            };

            this.unlisteners.push(unlistener);
        }

        return unlistener;
    }

    protected get unlisteners() {
        if (!this._unlisteners) {
            this._unlisteners = [];
        }

        return this._unlisteners;
    }
}

export type ServEventerOnEmitListener = (eventer: Eventer, args: any) => Promise<void>;

export class ServEventerManager {
    protected eventers: Eventer[];
    protected center: EventEmitter;
    protected onEmit?: ServEventerOnEmitListener;
    protected oldEmit?: EventEmitter['emit'];

    init(onEmit?: ServEventerOnEmitListener) {
        this.eventers = [];
        this.onEmit = onEmit;
        this.initCenter();
    }

    release() {
        this.eventers.forEach((item) => {
            item.detach();
        });
        this.releaseCenter();
        this.onEmit = undefined;
    }

    spawn(service: string, event: string) {
        const eventer = new Eventer(service, event);
        eventer.attach(this.center);
        this.eventers.push(eventer);

        return eventer;
    }

    rawEmit(service: string, event: string, args: any): void {
        try {
            if (this.center && this.oldEmit) {
                return this.oldEmit.call(this.center, Eventer.generateRawEvent(service, event), args);
            }
        } catch (e) {
            //
        }
    }

    protected initCenter() {
        this.center = new EventEmitter();

        // Inject center
        this.oldEmit = this.center.emit;
        const self = this;
        this.center.emit = function(event: string, eventer: Eventer, args: any) {
            let ret = false;
            try {
                if (self.oldEmit) {
                    ret = self.oldEmit.call(this, event, args);
                }
            } catch (e) {
                //
            }

            if (self.onEmit) {
                return self.onEmit(eventer, args);
            }

            return ret;
        } as any;
    }

    protected releaseCenter() {
        this.center = undefined!;
        this.oldEmit = undefined;
    }
}
