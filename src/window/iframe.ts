import { ServChannelWindow, ServWindowChannelConfig } from '../session/channel/ServWindowChannel';
export enum EServIFrameShowPolicy {
    NULL = 0,
    HIDE,
    SHOW,
    SHOW_ON_ECHO,
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

export class IFrameUtil {
    static generateCreator(config: ServIFrameCreatorConfig): Partial<ServWindowChannelConfig['master']> {
        const show = config.show ? config.show : (element: HTMLIFrameElement) => element.style.display = 'block';
        const hide = config.hide ? config.hide : (element: HTMLIFrameElement) => element.style.display = 'none';
        const showPolicy = config.showPolicy || EServIFrameShowPolicy.SHOW;
        const container = config.container || document.body;

        return {
            createWindow: () => {
                const element: HTMLIFrameElement = document.createElement('iframe');
                element.src = typeof config.url === 'function' ? config.url() : config.url;
                if (config.id) {
                    element.id = config.id;
                }

                if (config.className) {
                    element.className = config.className;
                }

                if (config.style) {
                    Object.keys(config.style).forEach((key) => {
                        (element.style as any)[key] = (config.style as any)[key];
                    });
                }

                if (showPolicy !== EServIFrameShowPolicy.SHOW) {
                    hide(element, container);
                } else {
                    show(element, container);
                }

                container.appendChild(element);

                return {
                    element,
                    target: element.contentWindow,
                    origin: config.postOrigin,
                };
            },
            destroyWindow: (windowInfo: ServChannelWindow) => {
                if (windowInfo.element) {
                    container.removeChild(windowInfo.element!);
                }
            },
            onCreate: config.onCreate,
            onEcho: (info) => {
                if (showPolicy === EServIFrameShowPolicy.SHOW_ON_ECHO) {
                    show(info.element as HTMLIFrameElement, container);
                }
                if (config.onEcho) {
                    config.onEcho(info);
                }
            },
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    }
}
