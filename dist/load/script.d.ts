import { ServEventLoaderChannelConfig, ServEventLoader } from '../session/channel/ServEventLoaderChannel';
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
export declare class ScriptUtil {
    static generateCreator(config: ServScriptLoaderCreatorConfig): ServEventLoaderChannelConfig['master'];
}
