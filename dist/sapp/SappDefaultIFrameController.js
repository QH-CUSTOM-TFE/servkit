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
exports.SappDefaultIFrameController = void 0;
var Sapp_1 = require("./Sapp");
var SappController_1 = require("./SappController");
var ServChannel_1 = require("../session/channel/ServChannel");
var iframe_1 = require("../window/iframe");
var common_1 = require("../common/common");
var query_1 = require("../common/query");
var SappDefaultIFrameController = /** @class */ (function (_super) {
    __extends(SappDefaultIFrameController, _super);
    function SappDefaultIFrameController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.layout = { options: {} };
        return _this;
    }
    SappDefaultIFrameController.prototype.doStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var layout;
            return __generator(this, function (_a) {
                layout = this.layout;
                if (layout.doStart) {
                    layout.doStart(this.app);
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultIFrameController.prototype.doClose = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var layout;
            return __generator(this, function (_a) {
                layout = this.layout;
                if (layout.doClose) {
                    layout.doClose(this.app);
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultIFrameController.prototype.doShow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var element, layout, className;
            return __generator(this, function (_a) {
                element = this.windowInfo.element;
                layout = this.layout;
                if (layout.doShow) {
                    layout.doShow(this.app);
                    return [2 /*return*/];
                }
                if (layout.showClassName) {
                    className = element.className;
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
                        element.style[key] = layout.showStyle[key];
                    });
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultIFrameController.prototype.doHide = function () {
        return __awaiter(this, void 0, void 0, function () {
            var element, layout, className;
            return __generator(this, function (_a) {
                element = this.windowInfo.element;
                layout = this.layout;
                if (layout.doHide) {
                    layout.doHide(this.app);
                    return [2 /*return*/];
                }
                if (layout.hideClassName) {
                    className = element.className;
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
                        element.style[key] = layout.hideStyle[key];
                    });
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        });
    };
    SappDefaultIFrameController.prototype.doCloseAfterAspect = function () {
        _super.prototype.doCloseAfterAspect.call(this);
        this.layout = { options: {} };
    };
    SappDefaultIFrameController.prototype.resetLayout = function (options) {
        var container = document.body;
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
        else if (this.app.info.options.layout) {
            container = document.querySelector(this.app.info.options.layout);
            if (!container) {
                common_1.asyncThrow(new Error("[SAPP] Can't query container with selector " + this.app.info.options.layout));
            }
        }
        var className = options.className;
        var style = options.style;
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
            options: options,
            container: container,
            className: className,
            style: style,
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
    };
    SappDefaultIFrameController.prototype.resolveSessionChannelConfig = function (options) {
        var _this = this;
        var layout = this.layout;
        return {
            type: ServChannel_1.EServChannel.WINDOW,
            config: {
                master: iframe_1.IFrameUtil.generateCreator({
                    url: function () {
                        var params = _this.resolveQueryParams(options);
                        var url = Sapp_1.Sapp.transformContentByInfo(_this.app.info.url, _this.app.info);
                        return query_1.wrapServQueryParams(url, params);
                    },
                    id: this.app.uuid,
                    showPolicy: iframe_1.EServIFrameShowPolicy.HIDE,
                    postOrigin: '*',
                    container: layout.container,
                    className: layout.className,
                    style: layout.style,
                    show: function () {
                        // Do nothing, work in doShow
                    },
                    hide: function () {
                        // Do nothing, work in doHide
                    },
                    onCreateWindow: function (info) {
                        _this.windowInfo = info;
                    },
                    onDestroyWindow: function () {
                        _this.windowInfo = undefined;
                    },
                }),
            },
        };
    };
    SappDefaultIFrameController.prototype.resolveQueryParams = function (options) {
        var params = {
            uuid: this.app.getTerminalId(),
        };
        return params;
    };
    return SappDefaultIFrameController;
}(SappController_1.SappController));
exports.SappDefaultIFrameController = SappDefaultIFrameController;
//# sourceMappingURL=SappDefaultIFrameController.js.map