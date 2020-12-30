"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptUtil = void 0;
var load_1 = require("./load");
var ScriptUtil = /** @class */ (function () {
    function ScriptUtil() {
    }
    ScriptUtil.generateCreator = function (config) {
        return {
            createLoader: function () {
                var load = function () {
                    var context = load_1.LoadUtil.loadScript({ url: config.url, timeout: config.timeout });
                    loader.context = context;
                    return context.loaded.then(function () {
                        if (config.onLoaderLoadSucceed) {
                            return config.onLoaderLoadSucceed(loader);
                        }
                    }, function (error) {
                        if (config.onLoaderLoadFailed) {
                            return config.onLoaderLoadFailed(loader);
                        }
                        return Promise.reject(error);
                    });
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
                if (loader.context) {
                    loader.context.clean();
                }
                delete loader.context;
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