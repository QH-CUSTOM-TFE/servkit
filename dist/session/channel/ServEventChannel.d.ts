import { ServSession } from '../ServSession';
import { ServChannel, ServChannelConfig, ServChannelPackage, ServChannelOpenOptions } from './ServChannel';
export interface ServEventChannelConfig extends ServChannelConfig {
}
export declare class ServEventChannel extends ServChannel {
    protected config: ServEventChannelConfig;
    protected asyncDispatchPromise: Promise<void>;
    init(session: ServSession, config: ServEventChannelConfig): void;
    open(options?: ServChannelOpenOptions): Promise<void>;
    close(): void;
    protected attachMessageChannel(): void;
    protected detachMessageChannel(): void;
    protected onEventMessage: (event: CustomEvent) => void;
    protected sendChannelPackage(pkg: ServChannelPackage): boolean;
}
