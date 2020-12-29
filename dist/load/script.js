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
exports.ScriptUtil = void 0;
var Deferred_1 = require("../common/Deferred");
var DEFAULT_LOAD_TIMEOUT = 30000;
var ScriptUtil = /** @class */ (function () {
    function ScriptUtil() {
    }
    ScriptUtil.generatePreloadCreator = function (config) {
        var _this = this;
        var context = {};
        var preload = function () { return __awaiter(_this, void 0, void 0, function () {
            var timeout, deferred, elOld, el, url;
            return __generator(this, function (_a) {
                timeout = config.timeout || DEFAULT_LOAD_TIMEOUT;
                deferred = Deferred_1.DeferredUtil.create({ timeout: timeout });
                if (config.id) { // Remove the old script element
                    elOld = document.querySelector("script[servkit=\"" + config.id + "\"]");
                    if (elOld && elOld.parentElement) {
                        elOld.parentElement.removeChild(elOld);
                    }
                }
                el = document.createElement('script');
                if (config.id) {
                    el.id = config.id;
                    el.setAttribute('servkit', config.id);
                }
                el.setAttribute('crossorigin', '');
                url = typeof config.url === 'function' ? config.url() : config.url;
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
                    deferred.resolve();
                };
                el.onerror = function (e) {
                    if (el && el.parentElement) {
                        el.parentElement.removeChild(el);
                    }
                    delete context.script;
                    deferred.reject(e);
                };
                return [2 /*return*/, deferred];
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
                                loader.script = context.script;
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
                if (context.script && context.script.parentElement) {
                    context.script.parentElement.removeChild(context.script);
                }
                delete context.script;
                delete loader.script;
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    };
    ScriptUtil.generateCreator = function (config) {
        return ScriptUtil.generatePreloadCreator(config);
    };
    return ScriptUtil;
}());
exports.ScriptUtil = ScriptUtil;
//# sourceMappingURL=script.js.map