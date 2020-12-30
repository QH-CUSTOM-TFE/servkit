"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SappPreloader = void 0;
var load_1 = require("../load/load");
var Sapp_1 = require("./Sapp");
var common_1 = require("../common/common");
var sInstance;
var SappPreloader = /** @class */ (function () {
    function SappPreloader() {
        this.contexts = {};
    }
    Object.defineProperty(SappPreloader, "instance", {
        get: function () {
            if (!sInstance) {
                sInstance = new SappPreloader();
            }
            return sInstance;
        },
        enumerable: false,
        configurable: true
    });
    SappPreloader.prototype.getPreloadDeferred = function (id) {
        var context = this.contexts[id];
        if (!context) {
            return;
        }
        return context ? context.loadContext.loaded : undefined;
    };
    SappPreloader.prototype.getPreloadBootstrap = function (id) {
        var context = this.contexts[id];
        return context ? context.bootstrap : undefined;
    };
    SappPreloader.prototype.setPreloadBootstrap = function (id, bootstrap) {
        var context = this.contexts[id];
        if (!context) {
            common_1.asyncThrow(new Error("[SAPPMGR] Preload context is not existed for " + id));
            return;
        }
        if (context.bootstrap) {
            common_1.asyncThrow(new Error("[SAPPMGR] Bootstrap conflict for " + id));
        }
        context.bootstrap = bootstrap;
    };
    SappPreloader.prototype.load = function (info) {
        var _this = this;
        if (info.type !== Sapp_1.ESappType.ASYNC_LOAD) {
            throw new Error("[SAPPMGR] Only async load app support preload");
        }
        var context = this.contexts[info.id];
        if (context) {
            return context.loadContext.loaded;
        }
        var loadContext;
        if (info.url) {
            var url = Sapp_1.Sapp.transformContentByInfo(info.url, info);
            loadContext = load_1.LoadUtil.loadScript({ url: url });
        }
        else if (info.html) {
            var html = Sapp_1.Sapp.transformContentByInfo(info.html, info);
            loadContext = load_1.LoadUtil.loadHtml({ html: html });
        }
        if (!loadContext) {
            throw new Error("[SAPPMGR] Preload fail");
        }
        this.contexts[info.id] = {
            loadContext: loadContext,
        };
        loadContext.loaded.catch(function () {
            loadContext.clean();
            delete _this.contexts[info.id];
        });
        return loadContext.loaded;
    };
    return SappPreloader;
}());
exports.SappPreloader = SappPreloader;
//# sourceMappingURL=SappPreloader.js.map