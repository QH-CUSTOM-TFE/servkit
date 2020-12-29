export declare const genLinkReplaceSymbol: (linkHref: any, preloadOrPrefetch?: boolean) => string;
export declare const genScriptReplaceSymbol: (scriptSrc: any, async?: boolean) => string;
export declare const inlineScriptReplaceSymbol = "<!-- inline scripts replaced by import-html-entry -->";
export declare const genIgnoreAssetReplaceSymbol: (url: any) => string;
export declare const genModuleScriptReplaceSymbol: (scriptSrc: any, moduleSupport: any) => string;
/**
 * parse the script link from the template
 * 1. collect stylesheets
 * 2. use global eval to evaluate the inline scripts
 *    see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function#Difference_between_Function_constructor_and_function_declaration
 *    see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Do_not_ever_use_eval!
 * @param tpl
 * @param baseURI
 * @stripStyles whether to strip the css links
 * @returns {{template: void | string | *, scripts: *[], entry: *}}
 */
export default function processTpl(tpl: any, baseURI: any): {
    template: any;
    scripts: never[];
    styles: never[];
    entry: never;
};
