import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { EServChannel } from '../session/channel/ServChannel';
import { IFrameUtil, EServIFrameShowPolicy, ServIFrameWindowInfo } from '../window/iframe';
import { asyncThrow } from '../common/common';
import { ServSessionConfig } from '../session/ServSession';
import { wrapServQueryParams } from '../common/query';
import { SappSDKStartParams } from './SappSDK';
import { SappCloseResult } from './service/m/SappLifecycle';

interface LayoutShowHide {
    options: SappLayoutOptions;
    container?: HTMLElement;
    doStart?: ((app: Sapp) => void);
    doClose?: ((app: Sapp) => void);
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
    className?: string;
    style?: SappLayoutOptions['style'];
}

export class SappDefaultIFrameController extends SappController {
    protected windowInfo: ServIFrameWindowInfo;
    protected layout: LayoutShowHide = { options: {} };

    async doStart() {
        const layout = this.layout;
        if (layout.doStart) {
            layout.doStart(this.app);
        }
    }

    async doClose(result?: SappCloseResult) {
        const layout = this.layout;
        if (layout.doClose) {
            layout.doClose(this.app);
        }
    }

    async doShow() {
        const element = this.windowInfo.element;
        const layout = this.layout;
        if (layout.doShow) {
            layout.doShow(this.app);
            return;
        }

        if (layout.showClassName) {
            let className = element.className;
            if (layout.hideClassName && className.indexOf(layout.hideClassName) >= 0) {
                className = className.replace(layout.hideClassName, layout.showClassName);
            } else {
                className = className + ' ' + layout.showClassName;
            }
            return;
        }

        if (layout.showStyle) {
            Object.keys(layout.showStyle).forEach((key) => {
                (element.style as any)[key] = (layout.showStyle as any)[key];
            });
            return;
        }
    }

    async doHide() {
        const element = this.windowInfo.element;
        const layout = this.layout;
        if (layout.doHide) {
            layout.doHide(this.app);
            return;
        }

        if (layout.hideClassName) {
            let className = element.className;
            if (layout.showClassName && className.indexOf(layout.showClassName) >= 0) {
                className = className.replace(layout.showClassName, layout.hideClassName);
            } else {
                className = className + ' ' + layout.hideClassName;
            }
            return;
        }

        if (layout.hideStyle) {
            Object.keys(layout.hideStyle).forEach((key) => {
                (element.style as any)[key] = (layout.hideStyle as any)[key];
            });
            return;
        }

    }

    protected doCloseAfterAspect() {
        super.doCloseAfterAspect();
        this.layout = { options: {} };
    }

    protected setupLayout(options: SappLayoutOptions) {
        let container: HTMLElement = document.body;
        if (options.container) {
            if (typeof options.container === 'string') {
                container = document.querySelector(options.container) as HTMLElement;
                if (!container) {
                    asyncThrow(new Error(`[SAPP] Can't query container with selector ${options.container}`));
                }
            } else {
                container = options.container;
            }
        }

        const className = options.className;
        let style: SappLayoutOptions['style'] = options.style;
        if (!className && !style) {
            style = {
                position: 'absolute',
                left: '0',
                top: '0',
                width: '100%',
                height: '100%',
                zIndex: '10000',
            };
        }

        this.layout = { 
            options,
            container,
            className,
            style,
            doStart: options.doStart,
            doClose: options.doClose,
            doShow: options.doShow,
            doHide: options.doHide,
            showClassName: options.showClassName,
            hideClassName: options.hideClassName,
            showStyle: options.showStyle,
            hideStyle: options.hideStyle,
        };

        if (!options.doShow && !options.showClassName && !options.showStyle) {
            this.layout.showStyle = {
                display: 'block',
            };
        }

        if (!options.doHide && !options.hideClassName && !options.hideStyle) {
            this.layout.hideStyle = {
                display: 'none',
            };
        }
    }

    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'] {
        const layout = this.layout;

        return {
            type: EServChannel.WINDOW,
            config: {
                master: IFrameUtil.generateCreator({
                    url: () => {
                        const params = this.resolveQueryParams(options);
                        const url = Sapp.transformContentByInfo(this.app.info.url, this.app.info);
                        return wrapServQueryParams(url, params);
                    },
                    id: this.app.uuid,
                    showPolicy: EServIFrameShowPolicy.HIDE,
                    postOrigin: '*',
                    container: layout.container,
                    className: layout.className,
                    style: layout.style,
                    show: () => {
                        // Do nothing, work in doShow
                    },
                    hide: () => {
                        // Do nothing, work in doHide
                    },
                    onCreateWindow: (info) => {
                        this.windowInfo = info;
                    },
                    onDestroyWindow: () => {
                        this.windowInfo = undefined!;
                    },
                }),
            },
        };
    }

    protected resolveQueryParams(options: SappCreateOptions) {
        const params: SappSDKStartParams = {
            uuid: this.app.getTerminalId(),
        };

        return params;
    }
}
