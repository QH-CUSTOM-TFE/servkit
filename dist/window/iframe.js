"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFrameUtil = exports.EServIFrameShowPolicy = void 0;
var EServIFrameShowPolicy;
(function (EServIFrameShowPolicy) {
    EServIFrameShowPolicy[EServIFrameShowPolicy["NULL"] = 0] = "NULL";
    EServIFrameShowPolicy[EServIFrameShowPolicy["HIDE"] = 1] = "HIDE";
    EServIFrameShowPolicy[EServIFrameShowPolicy["SHOW"] = 2] = "SHOW";
    EServIFrameShowPolicy[EServIFrameShowPolicy["SHOW_ON_ECHO"] = 3] = "SHOW_ON_ECHO";
})(EServIFrameShowPolicy = exports.EServIFrameShowPolicy || (exports.EServIFrameShowPolicy = {}));
var IFrameUtil = /** @class */ (function () {
    function IFrameUtil() {
    }
    IFrameUtil.generateCreator = function (config) {
        var show = config.show ? config.show : function (element) { return element.style.display = 'block'; };
        var hide = config.hide ? config.hide : function (element) { return element.style.display = 'none'; };
        var showPolicy = config.showPolicy || EServIFrameShowPolicy.SHOW;
        var container = config.container || document.body;
        return {
            createWindow: function () {
                var element = document.createElement('iframe');
                element.src = typeof config.url === 'function' ? config.url() : config.url;
                if (config.id) {
                    element.id = config.id;
                }
                if (config.className) {
                    element.className = config.className;
                }
                if (config.style) {
                    Object.keys(config.style).forEach(function (key) {
                        element.style[key] = config.style[key];
                    });
                }
                if (showPolicy !== EServIFrameShowPolicy.SHOW) {
                    hide(element, container);
                }
                else {
                    show(element, container);
                }
                container.appendChild(element);
                var ret = {
                    container: container,
                    element: element,
                    target: element.contentWindow,
                    origin: config.postOrigin || '*',
                };
                if (config.onCreateWindow) {
                    config.onCreateWindow(ret);
                }
                return ret;
            },
            destroyWindow: function (windowInfo) {
                if (config.onDestroyWindow) {
                    config.onDestroyWindow(windowInfo);
                }
                if (windowInfo.element) {
                    container.removeChild(windowInfo.element);
                }
            },
            onCreate: config.onCreate,
            onEcho: function (info) {
                if (showPolicy === EServIFrameShowPolicy.SHOW_ON_ECHO) {
                    show(info.element, container);
                }
                if (config.onEcho) {
                    config.onEcho(info);
                }
            },
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    };
    return IFrameUtil;
}());
exports.IFrameUtil = IFrameUtil;
//# sourceMappingURL=iframe.js.map