"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLUtil = void 0;
var load_1 = require("./load");
var HTMLUtil = /** @class */ (function () {
    function HTMLUtil() {
    }
    HTMLUtil.generateCreator = function (config) {
        return {
            createLoader: function () {
                var load = function () {
                    var context = load_1.LoadUtil.loadHtml({ html: config.html, timeout: config.timeout });
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
                loader.context = undefined;
            },
            onCreate: config.onCreate,
            onEcho: config.onEcho,
            onOpened: config.onOpened,
            onOpenError: config.onOpenError,
            onDestroy: config.onDestroy,
            onClosed: config.onClosed,
        };
    };
    return HTMLUtil;
}());
exports.HTMLUtil = HTMLUtil;
//# sourceMappingURL=html.js.map