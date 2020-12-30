import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
import { LoadHtmlContext } from './load';
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
export declare class HTMLUtil {
    static generateCreator(config: ServHtmlLoaderCreatorConfig): ServEventLoaderChannelConfig['master'];
}
