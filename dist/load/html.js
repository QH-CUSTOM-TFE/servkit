"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLUtil = void 0;
var Deferred_1 = require("../common/Deferred");
var processTpl_1 = require("./importHtml/processTpl");
var utils_1 = require("./importHtml/utils");
var DEFAULT_LOAD_TIMEOUT = 60000;
var DEFAULT_HTML_LOAD_TIMEOUT = 30000;
var HTMLUtil = /** @class */ (function () {
    function HTMLUtil() {
    }
    HTMLUtil.generatePreloadCreator = function (config) {
        var _this = this;
        var context = {};
        var preload = function () { return __awaiter(_this, void 0, void 0, function () {
            var timeout, d, htmlContent, url, fetch_1, xhrDeferred_1, xhr_1, html, elScripts, elStyles, assets, waits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeout = config.timeout || DEFAULT_LOAD_TIMEOUT;
                        d = Deferred_1.DeferredUtil.create({ timeout: timeout });
                        htmlContent = config.htmlContent;
                        if (!config.htmlUrl) return [3 /*break*/, 4];
                        url = typeof config.htmlUrl === 'function' ? config.htmlUrl() : config.htmlUrl;
                        fetch_1 = window.fetch;
                        if (!fetch_1) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetch_1(url)
                                .then(function (response) { return utils_1.readResAsString(response, false); })];
                    case 1:
                        htmlContent = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        xhrDeferred_1 = Deferred_1.DeferredUtil.create();
                        xhr_1 = new window.XMLHttpRequest();
                        xhr_1.open('GET', url, true);
                        xhr_1.timeout = DEFAULT_HTML_LOAD_TIMEOUT;
                        xhr_1.responseType = 'text';
                        xhr_1.onload = function (res) {
                            xhrDeferred_1.resolve(xhr_1.responseText);
                        };
                        xhr_1.onabort = function () {
                            xhrDeferred_1.reject(new Error('abort'));
                        };
                        xhr_1.onerror = function () {
                            xhrDeferred_1.reject(new Error('request failed with ' + xhr_1.status + ' ' + xhr_1.statusText));
                        };
                        xhr_1.ontimeout = function () {
                            xhrDeferred_1.reject(new Error('timeout'));
                        };
                        xhr_1.send();
                        return [4 /*yield*/, xhrDeferred_1];
                    case 3:
                        htmlContent = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(typeof htmlContent === 'function')) return [3 /*break*/, 6];
                        return [4 /*yield*/, htmlContent()];
                    case 5:
                        htmlContent = _a.sent();
                        _a.label = 6;
                    case 6:
                        html = htmlContent;
                        if (!html) {
                            return [2 /*return*/, Promise.reject(new Error('[SERVKIT] html is invalid for html loader'))];
                        }
                        elScripts = [];
                        elStyles = [];
                        assets = processTpl_1.default(html, utils_1.defaultGetPublicPath(window.location.href));
                        waits = assets.styles
                            .filter(function (item) { return !utils_1.isInlineCode(item); })
                            .map(function (url) {
                            var deferred = Deferred_1.DeferredUtil.create();
                            var el = document.createElement('link');
                            el.rel = 'stylesheet';
                            el.href = url;
                            if (document.head) {
                                document.head.appendChild(el);
                            }
                            else if (document.body) {
                                document.body.appendChild(el);
                            }
                            else {
                                document.appendChild(el);
                            }
                            el.onload = function () {
                                deferred.resolve();
                            };
                            el.onerror = function (e) {
                                deferred.resolve(); // Don't care about fail of styles
                            };
                            elStyles.push(el);
                            return deferred;
                        });
                        assets.scripts
                            .filter(function (item) { return !utils_1.isInlineCode(item); })
                            .forEach(function (url) {
                            var deferred = Deferred_1.DeferredUtil.create();
                            var el = document.createElement('script');
                            el.setAttribute('crossorigin', '');
                            el.src = url;
                            if (document.head) {
                                document.head.appendChild(el);
                            }
                            else if (document.body) {
                                document.body.appendChild(el);
                            }
                            else {
                                document.appendChild(el);
                            }
                            el.onload = function () {
                                deferred.resolve();
                            };
                            el.onerror = function (e) {
                                deferred.reject(e);
                            };
                            elScripts.push(el);
                            waits.push(deferred);
                        });
                        context.loaded = d;
                        context.scripts = elScripts;
                        context.styles = elStyles;
                        Promise.all(waits).then(function () {
                            d.resolve();
                        }, function (error) {
                            if (elStyles) {
                                elStyles.forEach(function (item) {
                                    if (item.parentElement) {
                                        item.parentElement.removeChild(item);
                                    }
                                });
                            }
                            if (elScripts) {
                                elScripts.forEach(function (item) {
                                    if (item.parentElement) {
                                        item.parentElement.removeChild(item);
                                    }
                                });
                            }
                            delete context.scripts;
                            delete context.styles;
                            d.reject(error);
                        });
                        return [2 /*return*/, d];
                }
            });
        }); };
        return {
            preload: preload,
            createLoader: function () {
                var load = function () { return __awaiter(_this, void 0, void 0, function () {
                    var d, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                d = context.loaded;
                                if (!d) {
                                    d = preload();
                                }
                                return [4 /*yield*/, d];
                            case 1:
                                _a.sent();
                                if (!config.load) return [3 /*break*/, 3];
                                return [4 /*yield*/, config.load()];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                if (config.onLoaderLoadSucceed) {
                                    config.onLoaderLoadSucceed(loader);
                                }
                                loader.scripts = context.scripts;
                                loader.styles = context.styles;
                                return [3 /*break*/, 5];
                            case 4:
                                e_1 = _a.sent();
                                if (config.onLoaderLoadFailed) {
                                    config.onLoaderLoadFailed(loader);
                                }
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); };
                var loader = {
                    load: load,
                };
                if (config.onCreateLoader) {
                    config.onCreateLoader(loader);
                }
                return loader;
            },
            destroyLoader: function (loader) {
                if (config.onDestroyLoader) {
                    config.onDestroyLoader(loader);
                }
                if (context.styles) {
                    context.styles.forEach(function (item) {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    });
                }
                if (context.scripts) {
                    context.scripts.forEach(function (item) {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    });
                }
                delete loader.styles;
                delete loader.scripts;
                delete context.styles;
                delete context.scripts;
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    };
    HTMLUtil.generateCreator = function (config) {
        return HTMLUtil.generatePreloadCreator(config);
    };
    return HTMLUtil;
}());
exports.HTMLUtil = HTMLUtil;
//# sourceMappingURL=html.js.map