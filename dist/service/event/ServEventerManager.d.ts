import { EventEmitter } from 'eventemitter3';
import { ServEventer, ServEventListener, ServEventUnListener } from '../ServService';
declare class Eventer implements ServEventer {
    static generateRawEvent(service: string, event: string): string;
    service: string;
    event: string;
    protected rawEvent: string;
    protected _unlisteners?: ServEventUnListener[];
    protected center?: EventEmitter;
    constructor(service: string, event: string);
    on(listener: ServEventListener): ServEventUnListener;
    once(listener: ServEventListener): ServEventUnListener;
    emit(args: any): Promise<void>;
    attach(center: EventEmitter): void;
    detach(): void;
    protected generateUnlitener(listener: ServEventListener): ServEventUnListener;
    protected get unlisteners(): ServEventUnListener[];
}
export declare type ServEventerOnEmitListener = (eventer: Eventer, args: any) => Promise<void>;
export declare class ServEventerManager {
    protected eventers: Eventer[];
    protected center: EventEmitter;
    protected onEmit?: ServEventerOnEmitListener;
    protected oldEmit?: EventEmitter['emit'];
    init(onEmit?: ServEventerOnEmitListener): void;
    release(): void;
    spawn(service: string, event: string): Eventer;
    rawEmit(service: string, event: string, args: any): void;
    protected initCenter(): void;
    protected releaseCenter(): void;
}
export {};
