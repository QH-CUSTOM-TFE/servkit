import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
import { LoadScriptContext, LoadUtil } from './load';

export interface ServScriptLoader extends ServEventLoader {
    context?: LoadScriptContext;
}

export interface ServScriptLoaderCreatorConfig {
    url: string | (() => string);

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

export class ScriptUtil {
    static generateCreator(config: ServScriptLoaderCreatorConfig)
        : ServEventLoaderChannelConfig['master'] {

        return {
            createLoader: (): ServScriptLoader => {
                const load = () => {
                    const context = LoadUtil.loadScript({ url: config.url, timeout: config.timeout });
                    loader.context = context;

                    return context.loaded.then(() => {
                        if (config.onLoaderLoadSucceed) {
                            return config.onLoaderLoadSucceed(loader);
                        }
                    }, (error) => {
                        if (config.onLoaderLoadFailed) {
                            return config.onLoaderLoadFailed(loader);
                        }

                        return Promise.reject(error);
                    });
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

                if (loader.context) {
                    loader.context.clean();
                }

                delete loader.context;
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
