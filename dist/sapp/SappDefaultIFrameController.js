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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SappDefaultIFrameController = void 0;
var SappController_1 = require("./SappController");
var ServChannel_1 = require("../session/channel/ServChannel");
var iframe_1 = require("../window/iframe");
var index_1 = require("../common/index");
var SappDefaultIFrameController = /** @class */ (function (_super) {
    __extends(SappDefaultIFrameController, _super);
    function SappDefaultIFrameController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.layout = {};
        return _this;
    }
    SappDefaultIFrameController.prototype.doShow = function () {
        var element = this.windowInfo.element;
        var layout = this.layout;
        if (layout.doShow) {
            layout.doShow(this.app);
            return;
        }
        if (layout.showClassName) {
            var className = element.className;
            if (layout.hideClassName && className.indexOf(layout.hideClassName) >= 0) {
                className = className.replace(layout.hideClassName, layout.showClassName);
            }
            else {
                className = className + ' ' + layout.showClassName;
            }
            return;
        }
        if (layout.showStyle) {
            Object.keys(layout.showStyle).forEach(function (key) {
                element.style[key] = layout.showStyle[key];
            });
            return;
        }
    };
    SappDefaultIFrameController.prototype.doHide = function () {
        var element = this.windowInfo.element;
        var layout = this.layout;
        if (layout.doHide) {
            layout.doHide(this.app);
            return;
        }
        if (layout.hideClassName) {
            var className = element.className;
            if (layout.showClassName && className.indexOf(layout.showClassName) >= 0) {
                className = className.replace(layout.showClassName, layout.hideClassName);
            }
            else {
                className = className + ' ' + layout.hideClassName;
            }
            return;
        }
        if (layout.hideStyle) {
            Object.keys(layout.hideStyle).forEach(function (key) {
                element.style[key] = layout.hideStyle[key];
            });
            return;
        }
    };
    SappDefaultIFrameController.prototype.doCloseAfterAspect = function () {
        _super.prototype.doCloseAfterAspect.call(this);
        this.layout = {};
    };
    SappDefaultIFrameController.prototype.resolveSessionChannelConfig = function (options) {
        var _this = this;
        var layout = this.layoutOptions || options.layout || {};
        if (typeof layout === 'function') {
            layout = layout(this.app);
        }
        var container = document.body;
        if (layout.container) {
            if (typeof layout.container === 'string') {
                container = document.querySelector(layout.container);
                if (!container) {
                    index_1.asyncThrow(new Error("[SAPP] Can't query container with selector " + layout.container));
                }
            }
            else {
                container = layout.container;
            }
        }
        else if (this.app.info.options.layout) {
            container = document.querySelector(this.app.info.options.layout);
            if (!container) {
                index_1.asyncThrow(new Error("[SAPP] Can't query container with selector " + this.app.info.options.layout));
            }
        }
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
        var params = this.resolveQueryParams(options);
        return {
            type: ServChannel_1.EServChannel.WINDOW,
            config: {
                master: iframe_1.IFrameUtil.generateCreator({
                    url: index_1.wrapServQueryParams(this.app.info.url, params),
                    id: this.app.uuid,
                    showPolicy: iframe_1.EServIFrameShowPolicy.HIDE,
                    postOrigin: '*',
                    container: container,
                    className: className,
                    style: style,
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
            uuid: this.app.uuid,
        };
        return params;
    };
    return SappDefaultIFrameController;
}(SappController_1.SappController));
exports.SappDefaultIFrameController = SappDefaultIFrameController;
//# sourceMappingURL=SappDefaultIFrameController.js.map