import { Sapp } from './Sapp';
import { SappController } from './SappController';
import { SappCreateOptions, SappLayoutOptions } from './SappMGR';
import { EServChannel } from '../session/channel/ServChannel';
import { asyncThrow } from '../common/common';
import { ServSessionConfig } from '../session/ServSession';
import { SappSDKAsyncLoadStartParams } from './SappSDK';
import { delAsyncLoadStartParams, putAsyncLoadStartParams, getAsyncLoadDeclContext } from '../common/sharedParams';
import { SappPreloader } from './SappPreloader';
import { LoadUtil } from '../load/load';
import { SappCloseResult } from './service/m/SappLifecycle';

interface LayoutShowHide {
    options: SappLayoutOptions;
    container: HTMLElement;
    doStart?: ((app: Sapp) => void);
    doClose?: ((app: Sapp) => void);
    doShow?: ((app: Sapp) => void);
    doHide?: ((app: Sapp) => void);
    showClassName?: string;
    showStyle?: Partial<HTMLElement['style']>;
    hideClassName?: string;
    hideStyle?: Partial<HTMLElement['style']>;
}

export class SappDefaultAsyncLoadController extends SappController {
    protected layout?: LayoutShowHide;

    async doStart() {
        const layout = this.layout;
        if (layout && layout.doStart) {
            layout.doStart(this.app);
        }
    }

    async doClose(result?: SappCloseResult) {
        const layout = this.layout;
        if (layout && layout.doClose) {
            layout.doClose(this.app);
        }
    }

    async doShow() {
        const layout = this.layout;
        if (layout) {
            if (layout.doShow) {
                layout.doShow(this.app);
                return;
            }

            const element = layout.container;

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
    }

    async doHide() {
        const layout = this.layout;
        if (layout) {
            if (layout.doHide) {
                layout.doHide(this.app);
                return;
            }

            const element = layout.container;

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
    }

    protected doCloseAfterAspect() {
        super.doCloseAfterAspect();
        delete this.layout;
    }

    protected setupLayout(options: SappLayoutOptions) {
        let container: HTMLElement = undefined!;
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

        if (container) {
            this.layout = {
                options,
                container,
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
    }

    protected resolveSessionChannelConfig(options: SappCreateOptions): ServSessionConfig['channel'] {
        return {
            type: EServChannel.EVENT_LOADER,
            config: {
                master: this.generateLoadCreator(options),
            },
        };
    }

    protected resolveSharedParams(options: SappCreateOptions) {
        const params: SappSDKAsyncLoadStartParams = {
            uuid: this.app.getTerminalId(),
        };

        if (this.layout) {
            params.container = this.layout.container;
        }

        return params;
    }

    protected generateLoadCreator(options: SappCreateOptions) {
        return {
            createLoader: (channel) => {
                const load = async () => {
                    let context = getAsyncLoadDeclContext(this.app.info.id);
                    if (!context) { // Not loaded
                        const preloaded = SappPreloader.instance.getPreloadDeferred(this.app.info.id);
                        let needLoad = true;
                        if (preloaded) { // Has preload ?
                            try {
                                await preloaded;
                                needLoad = false;
                            } catch (e) {
                                asyncThrow(e);
                            }
                        }

                        if (needLoad) { // Need load by self
                            if (this.app.info.url) {
                                const url = Sapp.transformContentByInfo(this.app.info.url, this.app.info);
                                await LoadUtil.loadScript({
                                    url,
                                }).loaded;
                            } else {
                                const html = Sapp.transformContentByInfo(this.app.info.html!, this.app.info);
                                await LoadUtil.loadHtml({
                                    html,
                                }).loaded;
                            }
                        }
                    }

                    // Re-read the context, if not exist, load fail
                    context = getAsyncLoadDeclContext(this.app.info.id);
                    if (!context) {
                        if (!this.app.info.options.isPlainPage) {
                            throw new Error(`[SAPPMGR] Can't find bootstrap for preload app ${this.app.info.id}; Please ensure has decl bootstrap info by SappSDK.declAsyncLoad`);
                        }
                    } else {
                        const params = this.resolveSharedParams(options);
                        putAsyncLoadStartParams(this.app.info.id, params);
            
                        context.bootstrap();
                    }
                };

                return {
                    load,
                };
            },
            destroyLoader: (loader, channel) => {
                delAsyncLoadStartParams(this.app.info.id);
                const context = getAsyncLoadDeclContext(this.app.info.id);
                if (context) {
                    context.deBootstrap();
                }  
            },
        };
    }
}
