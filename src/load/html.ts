import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
import { LoadHtmlContext, LoadUtil } from './load';

export interface ServHtmlLoader extends ServEventLoader {
    context?: LoadHtmlContext;
}

export interface ServHtmlLoaderCreatorConfig {
    html: string | (() => Promise<string> | string);
    
    onCreateLoader?(loader: ServHtmlLoader): void;
    onDestroyLoader?(loader: ServHtmlLoader): void;
    onLoaderLoadSucceed?(loader: ServHtmlLoader): void;
    onLoaderLoadFailed?(loader: ServHtmlLoader): void;

    onCreate?(loader: ServHtmlLoader): void;
    onOpened?(loader: ServHtmlLoader): void;
    onOpenError?(): void;
    onDestroy?(loader: ServHtmlLoader): void;
    onClosed?(): void;
    onEcho?(loader: ServHtmlLoader): void;

    timeout?: number;
}

export class HTMLUtil {
    static generateCreator(config: ServHtmlLoaderCreatorConfig)
        : ServEventLoaderChannelConfig['master'] {
        return {
            createLoader: (): ServHtmlLoader => {
                const load = () => {
                    const context = LoadUtil.loadHtml({ html: config.html, timeout: config.timeout });
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

                const loader: ServHtmlLoader = {
                    load,
                };

                if (config.onCreateLoader) {
                    config.onCreateLoader(loader);
                }

                return loader;
            },
            destroyLoader: (loader: ServHtmlLoader) => {
                if (config.onDestroyLoader) {
                    config.onDestroyLoader(loader);
                }

                if (loader.context) {
                    loader.context.clean();
                }

                loader.context = undefined;
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
