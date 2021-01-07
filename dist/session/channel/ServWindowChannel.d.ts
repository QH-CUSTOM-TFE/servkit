import { ServChannel, ServChannelConfig, ServChannelPackage, ServChannelOpenOptions } from './ServChannel';
export interface ServChannelWindow {
    target: Window | null;
    window: Window | null;
    origin: string;
    element?: HTMLIFrameElement;
}
export interface ServChanleWindowData {
    target: Window | null;
    window?: Window;
    origin?: string;
    element?: HTMLIFrameElement;
}
export interface ServWindowChannelOpenOptions extends ServChannelOpenOptions {
    dontWaitSlaveEcho?: boolean;
}
export interface ServWindowChannelConfig extends ServChannelConfig {
    master?: {
        dontWaitEcho?: boolean;
        createWindow(channel: ServWindowChannel): ServChanleWindowData;
        destroyWindow(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onCreate?(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onOpened?(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onOpenError?(channel: ServWindowChannel): void;
        onDestroy?(windowInfo: ServChannelWindow, channel: ServWindowChannel): void;
        onClosed?(channel: ServWindowChannel): void;
        onEcho?(info: ServChannelWindow, channel: ServWindowChannel): void;
    };
    slave?: {
        getWindow(channel: ServWindowChannel): ServChanleWindowData;
    };
}
export declare class ServWindowChannel extends ServChannel {
    protected config: ServWindowChannelConfig;
    protected windowInfo: ServChannelWindow;
    protected doWaitSlaveCleanWork?: (() => void);
    open(options?: ServWindowChannelOpenOptions): Promise<void>;
    close(): void;
    protected waitSlaveEcho(options: ServWindowChannelOpenOptions): Promise<void>;
    protected slaveEcho(): void;
    protected attachMessageChannel(): void;
    protected detachMessageChannel?: () => void;
    protected onWindowMessage: (event: MessageEvent) => void;
    protected sendChannelPackage(msg: ServChannelPackage): boolean;
}
