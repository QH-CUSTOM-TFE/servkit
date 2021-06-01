"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SappDefaultAsyncLoadController = void 0;
var Sapp_1 = require("./Sapp");
var SappController_1 = require("./SappController");
var ServChannel_1 = require("../session/channel/ServChannel");
var common_1 = require("../common/common");
var sharedParams_1 = require("../common/sharedParams");
var SappPreloader_1 = require("./SappPreloader");
var load_1 = require("../load/load");
var SappDefaultAsyncLoadController = /** @class */ (function (_super) {
    __extends(SappDefaultAsyncLoadController, _super);
    function SappDefaultAsyncLoadController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SappDefaultAsyncLoadController.prototype.doStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var layout;
            return __generator(this, function (_a) {
                layout = this.layout;
                if (layout && layout.doStart) {
                    layout.doStart(this.app);
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultAsyncLoadController.prototype.doClose = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var layout;
            return __generator(this, function (_a) {
                layout = this.layout;
                if (layout && layout.doClose) {
                    layout.doClose(this.app);
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultAsyncLoadController.prototype.doShow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var layout, element_1, className;
            return __generator(this, function (_a) {
                layout = this.layout;
                if (layout) {
                    if (layout.doShow) {
                        layout.doShow(this.app);
                        return [2 /*return*/];
                    }
                    element_1 = layout.container;
                    if (layout.showClassName) {
                        className = element_1.className;
                        if (layout.hideClassName && className.indexOf(layout.hideClassName) >= 0) {
                            className = className.replace(layout.hideClassName, layout.showClassName);
                        }
                        else {
                            className = className + ' ' + layout.showClassName;
                        }
                        return [2 /*return*/];
                    }
                    if (layout.showStyle) {
                        Object.keys(layout.showStyle).forEach(function (key) {
                            element_1.style[key] = layout.showStyle[key];
                        });
                        return [2 /*return*/];
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultAsyncLoadController.prototype.doHide = function () {
        return __awaiter(this, void 0, void 0, function () {
            var layout, element_2, className;
            return __generator(this, function (_a) {
                layout = this.layout;
                if (layout) {
                    if (layout.doHide) {
                        layout.doHide(this.app);
                        return [2 /*return*/];
                    }
                    element_2 = layout.container;
                    if (layout.hideClassName) {
                        className = element_2.className;
                        if (layout.showClassName && className.indexOf(layout.showClassName) >= 0) {
                            className = className.replace(layout.showClassName, layout.hideClassName);
                        }
                        else {
                            className = className + ' ' + layout.hideClassName;
                        }
                        return [2 /*return*/];
                    }
                    if (layout.hideStyle) {
                        Object.keys(layout.hideStyle).forEach(function (key) {
                            element_2.style[key] = layout.hideStyle[key];
                        });
                        return [2 /*return*/];
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultAsyncLoadController.prototype.doCloseAfterAspect = function () {
        _super.prototype.doCloseAfterAspect.call(this);
        delete this.layout;
    };
    SappDefaultAsyncLoadController.prototype.setupLayout = function (options) {
        var container = undefined;
        if (options.container) {
            if (typeof options.container === 'string') {
                container = document.querySelector(options.container);
                if (!container) {
                    common_1.asyncThrow(new Error("[SAPP] Can't query container with selector " + options.container));
                }
            }
            else {
                container = options.container;
            }
        }
        if (container) {
            this.layout = {
                options: options,
                container: container,
                doStart: options.doStart,
                doClose: options.doClose,
                doShow: options.doShow,
                doHide: options.doHide,
                showClassName: options.showClassName,
                hideClassName: options.hideClassName,
                showStyle: options.showStyle,
                hideStyle: options.hideStyle,
            };
            if (!options.doShow && !options.showClassName && !options.showStyle) {
                this.layout.showStyle = {
                    display: 'block',
                };
            }
            if (!options.doHide && !options.hideClassName && !options.hideStyle) {
                this.layout.hideStyle = {
                    display: 'none',
                };
            }
        }
    };
    SappDefaultAsyncLoadController.prototype.resolveSessionChannelConfig = function (options) {
        return {
            type: ServChannel_1.EServChannel.EVENT_LOADER,
            config: {
                master: this.generateLoadCreator(options),
            },
        };
    };
    SappDefaultAsyncLoadController.prototype.resolveSharedParams = function (options) {
        var params = {
            uuid: this.app.getTerminalId(),
        };
        if (this.layout) {
            params.container = this.layout.container;
        }
        return params;
    };
    SappDefaultAsyncLoadController.prototype.generateLoadCreator = function (options) {
        var _this = this;
        return {
            createLoader: function (channel) {
                var load = function () { return __awaiter(_this, void 0, void 0, function () {
                    var context, preloaded, needLoad, e_1, url, html, params;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                context = sharedParams_1.getAsyncLoadDeclContext(this.app.info.id);
                                if (!!context) return [3 /*break*/, 8];
                                preloaded = SappPreloader_1.SappPreloader.instance.getPreloadDeferred(this.app.info.id);
                                needLoad = true;
                                if (!preloaded) return [3 /*break*/, 4];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, preloaded];
                            case 2:
                                _a.sent();
                                needLoad = false;
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _a.sent();
                                common_1.asyncThrow(e_1);
                                return [3 /*break*/, 4];
                            case 4:
                                if (!needLoad) return [3 /*break*/, 8];
                                if (!this.app.info.url) return [3 /*break*/, 6];
                                url = Sapp_1.Sapp.transformContentByInfo(this.app.info.url, this.app.info);
                                return [4 /*yield*/, load_1.LoadUtil.loadScript({
                                        url: url,
                                    }).loaded];
                            case 5:
                                _a.sent();
                                return [3 /*break*/, 8];
                            case 6:
                                html = Sapp_1.Sapp.transformContentByInfo(this.app.info.html, this.app.info);
                                return [4 /*yield*/, load_1.LoadUtil.loadHtml({
                                        html: html,
                                    }).loaded];
                            case 7:
                                _a.sent();
                                _a.label = 8;
                            case 8:
                                // Re-read the context, if not exist, load fail
                                context = sharedParams_1.getAsyncLoadDeclContext(this.app.info.id);
                                if (!context) {
                                    if (!this.app.info.options.isPlainPage) {
                                        throw new Error("[SAPPMGR] Can't find bootstrap for preload app " + this.app.info.id + "; Please ensure has decl bootstrap info by SappSDK.declAsyncLoad");
                                    }
                                }
                                else {
                                    params = this.resolveSharedParams(options);
                                    sharedParams_1.putAsyncLoadStartParams(this.app.info.id, params);
                                    context.bootstrap();
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                return {
                    load: load,
                };
            },
            destroyLoader: function (loader, channel) {
                sharedParams_1.delAsyncLoadStartParams(_this.app.info.id);
                var context = sharedParams_1.getAsyncLoadDeclContext(_this.app.info.id);
                if (context) {
                    context.deBootstrap();
                }
            },
        };
    };
    return SappDefaultAsyncLoadController;
}(SappController_1.SappController));
exports.SappDefaultAsyncLoadController = SappDefaultAsyncLoadController;
//# sourceMappingURL=SappDefaultAsyncLoadController.js.map