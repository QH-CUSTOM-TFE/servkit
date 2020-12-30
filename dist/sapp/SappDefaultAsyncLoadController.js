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
var script_1 = require("../load/script");
var sharedParams_1 = require("../common/sharedParams");
var html_1 = require("../load/html");
var SappPreloader_1 = require("./SappPreloader");
var SappDefaultAsyncLoadController = /** @class */ (function (_super) {
    __extends(SappDefaultAsyncLoadController, _super);
    function SappDefaultAsyncLoadController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
        sharedParams_1.delSharedParams(this.app.getServkit(), this.app.info.id);
        delete this.layout;
    };
    SappDefaultAsyncLoadController.prototype.resolveSessionChannelConfig = function (options) {
        var layout = this.layoutOptions || options.layout || {};
        if (typeof layout === 'function') {
            layout = layout(this.app);
        }
        var container = undefined;
        if (layout.container) {
            if (typeof layout.container === 'string') {
                container = document.querySelector(layout.container);
                if (!container) {
                    common_1.asyncThrow(new Error("[SAPP] Can't query container with selector " + layout.container));
                }
            }
            else {
                container = layout.container;
            }
        }
        else if (this.app.info.options.layout) {
            container = document.querySelector(this.app.info.options.layout);
            if (!container) {
                common_1.asyncThrow(new Error("[SAPP] Can't query container with selector " + this.app.info.options.layout));
            }
        }
        if (container) {
            var className = layout.className;
            var style = layout.style;
            if (!className && !style) {
                style = {
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: '100%',
                    zIndex: '10000',
                };
            }
            this.layout = {
                container: container,
                doShow: layout.doShow,
                doHide: layout.doHide,
                showClassName: layout.showClassName,
                hideClassName: layout.hideClassName,
                showStyle: layout.showStyle,
                hideStyle: layout.hideStyle,
            };
            if (!layout.doShow && !layout.showClassName && !layout.showStyle) {
                this.layout.showStyle = {
                    display: 'block',
                };
            }
            if (!layout.doHide && !layout.hideClassName && !layout.hideStyle) {
                this.layout.hideStyle = {
                    display: 'none',
                };
            }
        }
        var params = this.resolveSharedParams(options);
        sharedParams_1.putSharedParams(this.app.getServkit(), this.app.info.id, params);
        return {
            type: ServChannel_1.EServChannel.EVENT_LOADER,
            config: {
                master: this.generateLoadCreator(),
            },
        };
    };
    SappDefaultAsyncLoadController.prototype.resolveSharedParams = function (options) {
        var params = {
            uuid: this.app.uuid,
        };
        if (this.layout) {
            params.container = this.layout.container;
        }
        return params;
    };
    SappDefaultAsyncLoadController.prototype.generateLoadCreator = function () {
        var _this = this;
        var creator = undefined;
        if (this.app.info.url) {
            var url = Sapp_1.Sapp.transformContentByInfo(this.app.info.url, this.app.info);
            creator = script_1.ScriptUtil.generateCreator({
                url: url,
            });
        }
        else {
            var html = Sapp_1.Sapp.transformContentByInfo(this.app.info.html, this.app.info);
            creator = html_1.HTMLUtil.generateCreator({
                html: html,
            });
        }
        var preloaded = SappPreloader_1.SappPreloader.instance.getPreloadDeferred(this.app.info.id);
        if (!preloaded) {
            return creator;
        }
        var dgLoader;
        return {
            createLoader: function (channel) {
                var load = function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_1, bootstrap;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, preloaded];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_1 = _a.sent();
                                common_1.asyncThrow(e_1);
                                // Downgrade the normal loader
                                dgLoader = creator.createLoader(channel);
                                return [2 /*return*/, dgLoader.load()];
                            case 3:
                                bootstrap = SappPreloader_1.SappPreloader.instance.getPreloadBootstrap(this.app.info.id);
                                if (!bootstrap) {
                                    throw new Error("[SAPPMGR] Can't find bootstrap for preload app " + this.app.info.id + "; Please ensure the options.asyncLoadAppId is set for this app in sappSDK.setConfig");
                                }
                                bootstrap();
                                return [2 /*return*/];
                        }
                    });
                }); };
                return {
                    load: load,
                };
            },
            destroyLoader: function (loader, channel) {
                if (dgLoader) {
                    creator.destroyLoader(dgLoader, channel);
                }
            },
            onCreate: function (loader, channel) {
                if (dgLoader && creator.onCreate) {
                    creator.onCreate(dgLoader, channel);
                }
            },
            onOpened: function (loader, channel) {
                if (dgLoader && creator.onOpened) {
                    creator.onOpened(dgLoader, channel);
                }
            },
            onOpenError: function (channel) {
                if (dgLoader && creator.onOpenError) {
                    creator.onOpenError(channel);
                }
            },
            onDestroy: function (loader, channel) {
                if (dgLoader && creator.onDestroy) {
                    creator.onDestroy(loader, channel);
                }
            },
            onClosed: function (channel) {
                if (dgLoader && creator.onClosed) {
                    creator.onClosed(channel);
                }
            },
            onEcho: function (loader, channel) {
                if (dgLoader && creator.onEcho) {
                    creator.onEcho(loader, channel);
                }
            },
        };
    };
    return SappDefaultAsyncLoadController;
}(SappController_1.SappController));
exports.SappDefaultAsyncLoadController = SappDefaultAsyncLoadController;
//# sourceMappingURL=SappDefaultAsyncLoadController.js.map