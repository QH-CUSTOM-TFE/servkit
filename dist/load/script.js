"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptUtil = void 0;
var Deferred_1 = require("../common/Deferred");
var ScriptUtil = /** @class */ (function () {
    function ScriptUtil() {
    }
    ScriptUtil.generateCreator = function (config) {
        return {
            createLoader: function () {
                var load = function () {
                    var deferred = Deferred_1.DeferredUtil.create();
                    if (config.id) { // Remove the old script element
                        var elOld = document.querySelector("script[servkit=\"" + config.id + "\"]");
                        if (elOld && elOld.parentElement) {
                            elOld.parentElement.removeChild(elOld);
                        }
                    }
                    var el = document.createElement('script');
                    if (config.id) {
                        el.id = config.id;
                        el.setAttribute('servkit', config.id);
                    }
                    el.setAttribute('crossorigin', '');
                    var url = typeof config.url === 'function' ? config.url() : config.url;
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
                        if (config.onLoaderLoadSucceed) {
                            config.onLoaderLoadSucceed(loader);
                        }
                        deferred.resolve();
                    };
                    el.onerror = function (e) {
                        if (config.onLoaderLoadFailed) {
                            config.onLoaderLoadFailed(loader);
                        }
                        deferred.reject(e);
                    };
                    loader.script = el;
                    return deferred;
                };
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
                if (loader.script && loader.script.parentElement) {
                    loader.script.parentElement.removeChild(loader.script);
                }
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    };
    return ScriptUtil;
}());
exports.ScriptUtil = ScriptUtil;
//# sourceMappingURL=script.js.map