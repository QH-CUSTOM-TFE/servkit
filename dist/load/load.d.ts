import { Deferred } from '../common/Deferred';
export interface LoadContext {
    loaded: Deferred;
    clean: () => void;
}
export interface LoadHtmlContext extends LoadContext {
    scripts: HTMLScriptElement[];
    styles: HTMLStyleElement[];
}
export interface LoadScriptContext extends LoadContext {
    script?: HTMLScriptElement;
}
export interface LoadParams {
    timeout?: number;
}
export interface LoadHtmlParams extends LoadParams {
    html: string | (() => Promise<string> | string);
}
export interface LoadScriptParams extends LoadParams {
    url: string | (() => string);
}
export declare class LoadUtil {
    private static _loadHtml;
    static loadHtml(params: LoadHtmlParams): LoadHtmlContext;
    static _loadScript(url: LoadScriptParams['url'], context: LoadScriptContext): Promise<void>;
    static loadScript(params: LoadScriptParams): LoadScriptContext;
}
