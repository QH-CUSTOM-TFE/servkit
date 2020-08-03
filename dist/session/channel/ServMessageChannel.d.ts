import { ServWindowChannel } from './ServWindowChannel';
export interface ServMessageChannelConfig {
}
export declare class ServMessageChannel extends ServWindowChannel {
    protected config: ServMessageChannelConfig;
    open(): Promise<void>;
    protected onWindowMessage: (event: MessageEvent) => void;
}
