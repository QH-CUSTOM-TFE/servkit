import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { EServChannel } from '../session/channel/ServChannel';
import { IFrameUtil, EServIFrameShowPolicy, ServIFrameWindowInfo } from '../window/iframe';
import { asyncThrow } from '../common/common';
import { ServSessionConfig } from '../session/ServSession';
import { wrapServQueryParams } from '../common/query';
import { SappSDKStartParams } from './SappSDK';

interface LayoutShowHide {
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
}

export class SappDefaultIFrameController extends SappController {
    protected windowInfo: ServIFrameWindowInfo;
    protected layout: LayoutShowHide = {};

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
        this.layout = {};
    }

    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'] {
        let layout = this.layoutOptions || options.layout || {};
        if (typeof layout === 'function') {
            layout = layout(this.app);
        }

        let container: HTMLElement = document.body;
        if (layout.container) {
            if (typeof layout.container === 'string') {
                container = document.querySelector(layout.container) as HTMLElement;
                if (!container) {
                    asyncThrow(new Error(`[SAPP] Can't query container with selector ${layout.container}`));
                }
            } else {
                container = layout.container;
            }
        } else if (this.app.info.options.layout) {
            container = document.querySelector(this.app.info.options.layout) as HTMLElement;
            if (!container) {
                asyncThrow(new Error(`[SAPP] Can't query container with selector ${this.app.info.options.layout}`));
            }
        }

        const className = layout.className;
        let style: SappLayoutOptions['style'] = layout.style;
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
            doShow: layout.doShow,
            doHide: layout.doHide,
            showClassName: layout.showClassName,
            hideClassName: layout.hideClassName,
            showStyle: layout.showStyle,
            hideStyle: layout.hideStyle,
        };

        if (!layout.doShow && !layout.showClassName && !layout.showStyle) {
            this.layout.showStyle = {
                display: 'block',
            };
        }

        if (!layout.doHide && !layout.hideClassName && !layout.hideStyle) {
            this.layout.hideStyle = {
                display: 'none',
            };
        }

        const params = this.resolveQueryParams(options);

        const url = Sapp.transformContentByInfo(this.app.info.url, this.app.info);
        
        return {
            type: EServChannel.WINDOW,
            config: {
                master: IFrameUtil.generateCreator({
                    url: wrapServQueryParams(url, params),
                    id: this.app.uuid,
                    showPolicy: EServIFrameShowPolicy.HIDE,
                    postOrigin: '*',
                    container,
                    className,
                    style,
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
            uuid: this.app.uuid,
        };

        return params;
    }
}
