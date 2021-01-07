import { ServWindowChannel, ServWindowChannelOpenOptions } from './ServWindowChannel';
export interface ServMessageChannelConfig {
}
export declare class ServMessageChannel extends ServWindowChannel {
    protected config: ServMessageChannelConfig;
    open(options?: ServWindowChannelOpenOptions): Promise<void>;
    protected onWindowMessage: (event: MessageEvent) => void;
}
