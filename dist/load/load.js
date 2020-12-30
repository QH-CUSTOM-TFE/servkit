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
exports.LoadUtil = void 0;
var Deferred_1 = require("../common/Deferred");
var utils_1 = require("./importHtml/utils");
var processTpl_1 = require("./importHtml/processTpl");
var DEFAULT_LOAD_TIMEOUT = 60000;
var LoadUtil = /** @class */ (function () {
    function LoadUtil() {
    }
    LoadUtil._loadHtml = function (html, context) {
        return __awaiter(this, void 0, void 0, function () {
            var content, url, fetch_1, xhrDeferred_1, xhr_1, assets, waits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof html === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, html()];
                    case 1:
                        html = _a.sent();
                        _a.label = 2;
                    case 2:
                        content = '';
                        url = '';
                        if (html.startsWith('http') || html.startsWith('/')) {
                            url = html;
                        }
                        else if (html.indexOf('<script') >= 0 || html.indexOf('<link') >= 0) {
                            content = html;
                        }
                        else {
                            url = html;
                        }
                        if (!url) return [3 /*break*/, 6];
                        fetch_1 = window.fetch;
                        if (!fetch_1) return [3 /*break*/, 4];
                        return [4 /*yield*/, fetch_1(url)
                                .then(function (response) { return utils_1.readResAsString(response, false); })];
                    case 3:
                        content = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        xhrDeferred_1 = Deferred_1.DeferredUtil.create();
                        xhr_1 = new window.XMLHttpRequest();
                        xhr_1.open('GET', url, true);
                        xhr_1.timeout = DEFAULT_LOAD_TIMEOUT;
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
                    case 5:
                        content = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!content) {
                            return [2 /*return*/, Promise.reject(new Error('[SERVKIT] html is invalid for html loader'))];
                        }
                        assets = processTpl_1.default(content, utils_1.defaultGetPublicPath(window.location.href));
                        waits = assets.styles
                            .filter(function (item) { return !utils_1.isInlineCode(item); })
                            .map(function (href) {
                            var deferred = Deferred_1.DeferredUtil.create();
                            var el = document.createElement('link');
                            el.rel = 'stylesheet';
                            el.href = href;
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
                            context.styles.push(el);
                            return deferred;
                        });
                        assets.scripts
                            .filter(function (item) { return !utils_1.isInlineCode(item); })
                            .forEach(function (src) {
                            var deferred = Deferred_1.DeferredUtil.create();
                            var el = document.createElement('script');
                            el.setAttribute('crossorigin', '');
                            el.src = src;
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
                            context.scripts.push(el);
                            waits.push(deferred);
                        });
                        return [4 /*yield*/, Promise.all(waits).then(function () {
                                context.loaded.resolve();
                            }, function (error) {
                                context.loaded.reject(error);
                            })];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LoadUtil.loadHtml = function (params) {
        var timeout = params.timeout || DEFAULT_LOAD_TIMEOUT;
        var loaded = Deferred_1.DeferredUtil.create({ timeout: timeout });
        var context = {
            scripts: [],
            styles: [],
            loaded: loaded,
            clean: function () {
                context.styles.forEach(function (item) {
                    if (item.parentElement) {
                        item.parentElement.removeChild(item);
                    }
                });
                context.scripts.forEach(function (item) {
                    if (item.parentElement) {
                        item.parentElement.removeChild(item);
                    }
                });
                context.styles = [];
                context.scripts = [];
            },
        };
        context.loaded.catch(function () {
            context.clean();
        });
        LoadUtil._loadHtml(params.html, context);
        return context;
    };
    LoadUtil._loadScript = function (url, context) {
        return __awaiter(this, void 0, void 0, function () {
            var el;
            return __generator(this, function (_a) {
                if (typeof url === 'function') {
                    url = url();
                }
                el = document.createElement('script');
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
                context.script = el;
                el.onload = function () {
                    context.loaded.resolve();
                };
                el.onerror = function (error) {
                    context.loaded.reject(error);
                };
                return [2 /*return*/];
            });
        });
    };
    LoadUtil.loadScript = function (params) {
        var timeout = params.timeout || DEFAULT_LOAD_TIMEOUT;
        var loaded = Deferred_1.DeferredUtil.create({ timeout: timeout });
        var context = {
            loaded: loaded,
            clean: function () {
                if (context.script && context.script.parentElement) {
                    context.script.parentElement.removeChild(context.script);
                }
                delete context.script;
            },
        };
        context.loaded.catch(function () {
            context.clean();
        });
        LoadUtil._loadScript(params.url, context);
        return context;
    };
    return LoadUtil;
}());
exports.LoadUtil = LoadUtil;
//# sourceMappingURL=load.js.map