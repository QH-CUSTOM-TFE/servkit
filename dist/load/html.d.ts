import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
export interface ServHTMLLoader extends ServEventLoader {
    scripts?: HTMLScriptElement[];
    styles?: HTMLStyleElement[];
}
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
export declare class HTMLUtil {
    static generatePreloadCreator(config: ServHTMLPreloaderCreatorConfig): ServEventLoaderChannelConfig['master'] & {
        preload: () => Promise<void>;
    };
    static generateCreator(config: ServHTMLLoaderCreatorConfig): ServEventLoaderChannelConfig['master'];
}
