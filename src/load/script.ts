import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
import { DeferredUtil, Deferred } from '../common/Deferred';

export interface ServScriptLoader extends ServEventLoader {
    script?: HTMLScriptElement;
}

export interface ServScriptLoaderCreatorConfig {
    url: string | (() => string);
    id?: string;

    onCreateLoader?(loader: ServScriptLoader): void;
    onDestroyLoader?(loader: ServScriptLoader): void;
    onLoaderLoadSucceed?(loader: ServScriptLoader): void;
    onLoaderLoadFailed?(loader: ServScriptLoader): void;

    onCreate?(loader: ServScriptLoader): void;
    onOpened?(loader: ServScriptLoader): void;
    onOpenError?(): void;
    onDestroy?(loader: ServScriptLoader): void;
    onClosed?(): void;
    onEcho?(loader: ServScriptLoader): void;

    timeout?: number;
}

export interface ServScriptPreloaderCreatorConfig extends ServScriptLoaderCreatorConfig {
    load?: () => Promise<void> | void;
}

interface PreloadContext {
    script?: HTMLScriptElement;
    loaded?: Deferred;
}

const DEFAULT_LOAD_TIMEOUT = 30000;

export class ScriptUtil {
    static generatePreloadCreator(config: ServScriptPreloaderCreatorConfig)
        : ServEventLoaderChannelConfig['master'] & { preload: () => Promise<void> } {
        const context: PreloadContext = {};
        const preload = async () => {
            const timeout = config.timeout || DEFAULT_LOAD_TIMEOUT;
            const deferred = DeferredUtil.create({ timeout });
            if (config.id) { // Remove the old script element
                const elOld = document.querySelector(`script[servkit="${config.id}"]`);
                if (elOld && elOld.parentElement) {
                    elOld.parentElement.removeChild(elOld);
                }
            }

            const el = document.createElement('script');

            if (config.id) {
                el.id = config.id;
                el.setAttribute('servkit', config.id);
            }

            el.setAttribute('crossorigin', '');

            const url = typeof config.url === 'function' ? config.url() : config.url;
            el.src = url;

            if (document.head) {
                document.head.appendChild(el);
            } else if (document.body) {
                document.body.appendChild(el);
            } else {
                document.appendChild(el);
            }

            context.script = el;
            el.onload = () => {
                deferred.resolve();
            };

            el.onerror = (e) => {
                if (el && el.parentElement) {
                    el.parentElement.removeChild(el);
                }
                delete context.script;

                deferred.reject(e);
            };

            return deferred;
        };
        return {
            preload,
            createLoader: (): ServScriptLoader => {
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

                        loader.script = context.script;
                    } catch (e) {
                        if (config.onLoaderLoadFailed) {
                            config.onLoaderLoadFailed(loader);
                        }
                    }
                };

                const loader: ServScriptLoader = {
                    load,
                };

                if (config.onCreateLoader) {
                    config.onCreateLoader(loader);
                }

                return loader;
            },
            destroyLoader: (loader: ServScriptLoader) => {
                if (config.onDestroyLoader) {
                    config.onDestroyLoader(loader);
                }

                if (context.script && context.script.parentElement) {
                    context.script.parentElement.removeChild(context.script);
                }

                delete context.script;
                delete loader.script;
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    }

    static generateCreator(config: ServScriptLoaderCreatorConfig): ServEventLoaderChannelConfig['master'] {
        return ScriptUtil.generatePreloadCreator(config);
    }
}
