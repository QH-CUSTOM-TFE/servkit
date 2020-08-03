import { ServChannelWindow, ServWindowChannelConfig } from '../session/channel/ServWindowChannel';
export declare enum EServIFrameShowPolicy {
    NULL = 0,
    HIDE = 1,
    SHOW = 2,
    SHOW_ON_ECHO = 3
}
export interface ServIFrameCreatorConfig {
    url: string | (() => string);
    id?: string;
    showPolicy?: EServIFrameShowPolicy;
    postOrigin?: string;
    container?: HTMLElement;
    className?: string;
    style?: Partial<HTMLElement['style']>;
    show?: (element: HTMLIFrameElement, container?: HTMLElement) => void;
    hide?: (element: HTMLIFrameElement, container?: HTMLElement) => void;
    onCreate?: (info: ServChannelWindow) => void;
    onEcho?(info: ServChannelWindow): void;
    onOpened?(info: ServChannelWindow): void;
    onDestroy?(info: ServChannelWindow): void;
    onOpenError?(): void;
    onClosed?(): void;
}
export declare class IFrameUtil {
    static generateCreator(config: ServIFrameCreatorConfig): Partial<ServWindowChannelConfig['master']>;
}
