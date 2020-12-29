import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
import { DeferredUtil, Deferred } from '../common/Deferred';
import processTpl from './importHtml/processTpl';
import { defaultGetPublicPath, isInlineCode, readResAsString } from './importHtml/utils';

export interface ServHTMLLoader extends ServEventLoader {
    scripts?: HTMLScriptElement[];
    styles?: HTMLStyleElement[];
}

const DEFAULT_LOAD_TIMEOUT = 60000;
const DEFAULT_HTML_LOAD_TIMEOUT = 30000;

export interface ServHTMLLoaderCreatorConfig {
    htmlContent?: string | (() => Promise<string> | string);
    htmlUrl?: string | (() => string);
    
    onCreateLoader?(loader: ServHTMLLoader): void;
    onDestroyLoader?(loader: ServHTMLLoader): void;
    onLoaderLoadSucceed?(loader: ServHTMLLoader): void;
    onLoaderLoadFailed?(loader: ServHTMLLoader): void;

    onCreate?(loader: ServHTMLLoader): void;
    onOpened?(loader: ServHTMLLoader): void;
    onOpenError?(): void;
    onDestroy?(loader: ServHTMLLoader): void;
    onClosed?(): void;
    onEcho?(loader: ServHTMLLoader): void;

    timeout?: number;
}

export interface ServHTMLPreloaderCreatorConfig extends ServHTMLLoaderCreatorConfig {
    load?: () => Promise<void> | void;
}

interface PreloadContext {
    scripts?: HTMLScriptElement[];
    styles?: HTMLStyleElement[];
    loaded?: Deferred;
}

export class HTMLUtil {
    static generatePreloadCreator(config: ServHTMLPreloaderCreatorConfig)
        : ServEventLoaderChannelConfig['master'] & { preload: () => Promise<void> } {

        const context: PreloadContext = {};
        const preload = async () => {
            const timeout = config.timeout || DEFAULT_LOAD_TIMEOUT;
            const d = DeferredUtil.create({ timeout });
            
            let htmlContent = config.htmlContent;
            if (config.htmlUrl) {
                const url = typeof config.htmlUrl === 'function' ? config.htmlUrl() : config.htmlUrl;
                const fetch = window.fetch;
                if (fetch) {
                    htmlContent = await fetch(url)
                        .then((response) => readResAsString(response, false));
                } else {
                    const xhrDeferred = DeferredUtil.create<string>();
                    const xhr = new window.XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.timeout = DEFAULT_HTML_LOAD_TIMEOUT;
                    xhr.responseType = 'text';

                    xhr.onload = (res) => {
                        xhrDeferred.resolve(xhr.responseText);
                    };
                             
                    xhr.onabort = () => {
                        xhrDeferred.reject(new Error('abort'));
                    };
                    xhr.onerror = () => {
                        xhrDeferred.reject(new Error(
                            'request failed with ' + xhr.status + ' ' + xhr.statusText));
                    };
                        
                    xhr.ontimeout = () => {
                        xhrDeferred.reject(new Error('timeout'));
                    };

                    xhr.send();

                    htmlContent = await xhrDeferred;
                }
            }

            if (typeof htmlContent === 'function') {
                htmlContent = await htmlContent();
            }

            const html = htmlContent!;
            if (!html) {
                return Promise.reject(new Error('[SERVKIT] html is invalid for html loader'));
            }

            const elScripts: HTMLScriptElement[] = [];
            const elStyles: HTMLLinkElement[] = [];

            const assets = processTpl(html, defaultGetPublicPath(window.location.href));
            
            const waits = assets.styles
            .filter((item) => !isInlineCode(item))
            .map((url: string) => {
                const deferred = DeferredUtil.create();
            
                const el = document.createElement('link');

                el.rel = 'stylesheet';
                el.href = url;

                if (document.head) {
                    document.head.appendChild(el);
                } else if (document.body) {
                    document.body.appendChild(el);
                } else {
                    document.appendChild(el);
                }

                el.onload = () => {
                    deferred.resolve();
                };

                el.onerror = (e) => {
                    deferred.resolve(); // Don't care about fail of styles
                };

                elStyles.push(el);

                return deferred;
            });

            assets.scripts
                .filter((item) => !isInlineCode(item))
                .forEach((url: string) => {
                const deferred = DeferredUtil.create();
            
                const el = document.createElement('script');

                el.setAttribute('crossorigin', '');

                el.src = url;

                if (document.head) {
                    document.head.appendChild(el);
                } else if (document.body) {
                    document.body.appendChild(el);
                } else {
                    document.appendChild(el);
                }

                el.onload = () => {
                    deferred.resolve();
                };

                el.onerror = (e) => {
                    deferred.reject(e);
                };

                elScripts.push(el);

                waits.push(deferred);
            });

            context.loaded = d;
            context.scripts = elScripts;
            context.styles = elStyles;
            
            Promise.all(waits).then(() => {
                d.resolve();
            }, (error) => {
                if (elStyles) {
                    elStyles.forEach((item) => {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    });
                }

                if (elScripts) {
                    elScripts.forEach((item) => {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    });
                }

                delete context.scripts;
                delete context.styles;

                d.reject(error);
            });

            return d;
        };

        return {
            preload,
            createLoader: (): ServHTMLLoader => {
                const load = async () => {
                    try {
                        let d: Promise<void> | undefined = context.loaded;
                        if (!d) {
                            d = preload();
                        }

                        await d;

                        if (config.load) {
                            await config.load();
                        }

                        if (config.onLoaderLoadSucceed) {
                            config.onLoaderLoadSucceed(loader);
                        }

                        loader.scripts = context.scripts;
                        loader.styles = context.styles;
                    } catch (e) {
                        if (config.onLoaderLoadFailed) {
                            config.onLoaderLoadFailed(loader);
                        }
                    }
                };

                const loader: ServHTMLLoader = {
                    load,
                };

                if (config.onCreateLoader) {
                    config.onCreateLoader(loader);
                }

                return loader;
            },
            destroyLoader: (loader: ServHTMLLoader) => {
                if (config.onDestroyLoader) {
                    config.onDestroyLoader(loader);
                }

                if (context.styles) {
                    context.styles.forEach((item) => {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    });
                }

                if (context.scripts) {
                    context.scripts.forEach((item) => {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    });
                }

                delete loader.styles;
                delete loader.scripts;
                delete context.styles;
                delete context.scripts;
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    }

    static generateCreator(config: ServHTMLLoaderCreatorConfig): ServEventLoaderChannelConfig['master'] {
        return HTMLUtil.generatePreloadCreator(config);
    }
}
