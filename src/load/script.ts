import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
import { DeferredUtil } from '../common/Deferred';

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
}

export class ScriptUtil {
    static generateCreator(config: ServScriptLoaderCreatorConfig): ServEventLoaderChannelConfig['master'] {
        return {
            createLoader: (): ServScriptLoader => {
                const load = function() {
                    const deferred = DeferredUtil.create();
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

                    el.onload = () => {
                        if (config.onLoaderLoadSucceed) {
                            config.onLoaderLoadSucceed(loader);
                        }

                        deferred.resolve();
                    };

                    el.onerror = (e) => {
                        if (config.onLoaderLoadFailed) {
                            config.onLoaderLoadFailed(loader);
                        }

                        deferred.reject(e);
                    };

                    loader.script = el;

                    return deferred;
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

                if (loader.script && loader.script.parentElement) {
                    loader.script.parentElement.removeChild(loader.script);
                }
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    }
}
