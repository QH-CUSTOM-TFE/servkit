"use strict";
// tslint:disable
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.genModuleScriptReplaceSymbol = exports.genIgnoreAssetReplaceSymbol = exports.inlineScriptReplaceSymbol = exports.genScriptReplaceSymbol = exports.genLinkReplaceSymbol = void 0;
/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 15:04
 */
var utils_1 = require("./utils");
var ALL_SCRIPT_REGEX = /(<script[\s\S]*?>)[\s\S]*?<\/script>/gi;
var SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|')text\/ng-template\3)[\s\S])*?>[\s\S]*?<\/\1>/i;
var SCRIPT_SRC_REGEX = /.*\ssrc=('|")?([^>'"\s]+)/;
var SCRIPT_TYPE_REGEX = /.*\stype=('|")?([^>'"\s]+)/;
var SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
var SCRIPT_ASYNC_REGEX = /.*\sasync\s*.*/;
var SCRIPT_NO_MODULE_REGEX = /.*\snomodule\s*.*/;
var SCRIPT_MODULE_REGEX = /.*\stype=('|")?module('|")?\s*.*/;
var LINK_TAG_REGEX = /<(link)\s+[\s\S]*?>/ig;
var LINK_PRELOAD_OR_PREFETCH_REGEX = /\srel=('|")?(preload|prefetch)\1/;
var LINK_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
var LINK_AS_FONT = /.*\sas=('|")?font\1.*/;
var STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
var STYLE_TYPE_REGEX = /\s+rel=('|")?stylesheet\1.*/;
var STYLE_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
var HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
var LINK_IGNORE_REGEX = /<link(\s+|\s+[\s\S]+\s+)ignore(\s*|\s+[\s\S]*|=[\s\S]*)>/i;
var STYLE_IGNORE_REGEX = /<style(\s+|\s+[\s\S]+\s+)ignore(\s*|\s+[\s\S]*|=[\s\S]*)>/i;
var SCRIPT_IGNORE_REGEX = /<script(\s+|\s+[\s\S]+\s+)ignore(\s*|\s+[\s\S]*|=[\s\S]*)>/i;
function hasProtocol(url) {
    return url.startsWith('//') || url.startsWith('http://') || url.startsWith('https://');
}
function getEntirePath(path, baseURI) {
    return new URL(path, baseURI).toString();
}
function isValidJavaScriptType(type) {
    var handleTypes = ['text/javascript', 'module', 'application/javascript', 'text/ecmascript', 'application/ecmascript'];
    return !type || handleTypes.indexOf(type) !== -1;
}
exports.genLinkReplaceSymbol = function (linkHref, preloadOrPrefetch) {
    if (preloadOrPrefetch === void 0) { preloadOrPrefetch = false; }
    return "<!-- " + (preloadOrPrefetch ? 'prefetch/preload' : '') + " link " + linkHref + " replaced by import-html-entry -->";
};
exports.genScriptReplaceSymbol = function (scriptSrc, async) {
    if (async === void 0) { async = false; }
    return "<!-- " + (async ? 'async' : '') + " script " + scriptSrc + " replaced by import-html-entry -->";
};
exports.inlineScriptReplaceSymbol = "<!-- inline scripts replaced by import-html-entry -->";
exports.genIgnoreAssetReplaceSymbol = function (url) { return "<!-- ignore asset " + (url || 'file') + " replaced by import-html-entry -->"; };
exports.genModuleScriptReplaceSymbol = function (scriptSrc, moduleSupport) { return "<!-- " + (moduleSupport ? 'nomodule' : 'module') + " script " + scriptSrc + " ignored by import-html-entry -->"; };
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
function processTpl(tpl, baseURI) {
    var scripts = [];
    var styles = [];
    var entry = null;
    var moduleSupport = utils_1.isModuleScriptSupported();
    var template = tpl
        /*
        remove html comment first
        */
        .replace(HTML_COMMENT_REGEX, '')
        .replace(LINK_TAG_REGEX, function (match) {
        /*
        change the css link
        */
        var styleType = !!match.match(STYLE_TYPE_REGEX);
        if (styleType) {
            var styleHref = match.match(STYLE_HREF_REGEX);
            var styleIgnore = match.match(LINK_IGNORE_REGEX);
            if (styleHref) {
                var href = styleHref && styleHref[2];
                var newHref = href;
                if (href && !hasProtocol(href)) {
                    newHref = getEntirePath(href, baseURI);
                }
                if (styleIgnore) {
                    return exports.genIgnoreAssetReplaceSymbol(newHref);
                }
                styles.push(newHref);
                return exports.genLinkReplaceSymbol(newHref);
            }
        }
        var preloadOrPrefetchType = match.match(LINK_PRELOAD_OR_PREFETCH_REGEX) && match.match(LINK_HREF_REGEX) && !match.match(LINK_AS_FONT);
        if (preloadOrPrefetchType) {
            var _a = match.match(LINK_HREF_REGEX), linkHref = _a[2];
            return exports.genLinkReplaceSymbol(linkHref, true);
        }
        return match;
    })
        .replace(STYLE_TAG_REGEX, function (match) {
        if (STYLE_IGNORE_REGEX.test(match)) {
            return exports.genIgnoreAssetReplaceSymbol('style file');
        }
        return match;
    })
        .replace(ALL_SCRIPT_REGEX, function (match, scriptTag) {
        var scriptIgnore = scriptTag.match(SCRIPT_IGNORE_REGEX);
        var moduleScriptIgnore = (moduleSupport && !!scriptTag.match(SCRIPT_NO_MODULE_REGEX)) ||
            (!moduleSupport && !!scriptTag.match(SCRIPT_MODULE_REGEX));
        // in order to keep the exec order of all javascripts
        var matchedScriptTypeMatch = scriptTag.match(SCRIPT_TYPE_REGEX);
        var matchedScriptType = matchedScriptTypeMatch && matchedScriptTypeMatch[2];
        if (!isValidJavaScriptType(matchedScriptType)) {
            return match;
        }
        // if it is a external script
        if (SCRIPT_TAG_REGEX.test(match) && scriptTag.match(SCRIPT_SRC_REGEX)) {
            /*
            collect scripts and replace the ref
            */
            var matchedScriptEntry = scriptTag.match(SCRIPT_ENTRY_REGEX);
            var matchedScriptSrcMatch = scriptTag.match(SCRIPT_SRC_REGEX);
            var matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];
            if (entry && matchedScriptEntry) {
                throw new SyntaxError('You should not set multiply entry script!');
            }
            else {
                // append the domain while the script not have an protocol prefix
                if (matchedScriptSrc && !hasProtocol(matchedScriptSrc)) {
                    matchedScriptSrc = getEntirePath(matchedScriptSrc, baseURI);
                }
                entry = entry || matchedScriptEntry && matchedScriptSrc;
            }
            if (scriptIgnore) {
                return exports.genIgnoreAssetReplaceSymbol(matchedScriptSrc || 'js file');
            }
            if (moduleScriptIgnore) {
                return exports.genModuleScriptReplaceSymbol(matchedScriptSrc || 'js file', moduleSupport);
            }
            if (matchedScriptSrc) {
                var asyncScript = !!scriptTag.match(SCRIPT_ASYNC_REGEX);
                scripts.push(asyncScript ? { async: true, src: matchedScriptSrc } : matchedScriptSrc);
                return exports.genScriptReplaceSymbol(matchedScriptSrc, asyncScript);
            }
            return match;
        }
        else {
            if (scriptIgnore) {
                return exports.genIgnoreAssetReplaceSymbol('js file');
            }
            if (moduleScriptIgnore) {
                return exports.genModuleScriptReplaceSymbol('js file', moduleSupport);
            }
            // if it is an inline script
            var code = utils_1.getInlineCode(match);
            // remove script blocks when all of these lines are comments.
            var isPureCommentBlock = code.split(/[\r\n]+/).every(function (line) { return !line.trim() || line.trim().startsWith('//'); });
            if (!isPureCommentBlock) {
                scripts.push(match);
            }
            return exports.inlineScriptReplaceSymbol;
        }
    });
    scripts = scripts.filter(function (script) {
        // filter empty script
        return !!script;
    });
    return {
        template: template,
        scripts: scripts,
        styles: styles,
        // set the last script as entry if have not set
        entry: entry || scripts[scripts.length - 1],
    };
}
exports.default = processTpl;
// WEBPACK FOOTER //
// ./node_modules/servkit/src/load/importHtml/processTpl.ts
//# sourceMappingURL=processTpl.js.map