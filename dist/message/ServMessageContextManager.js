"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServMessageContextManager = exports.ServContextedMessage = void 0;
var ServContextedMessage = /** @class */ (function () {
    function ServContextedMessage() {
    }
    return ServContextedMessage;
}());
exports.ServContextedMessage = ServContextedMessage;
var ServMessageContextManager = /** @class */ (function () {
    function ServMessageContextManager() {
    }
    ServMessageContextManager.prototype.init = function () {
        this.contexts = {};
    };
    ServMessageContextManager.prototype.release = function () {
        this.contexts = {};
    };
    ServMessageContextManager.prototype.add = function (message, options) {
        var _this = this;
        var id = message.$id;
        var ctxt = this.contexts[id];
        if (ctxt) {
            return;
        }
        var resolve;
        var reject;
        var promise = new Promise(function (res, rej) {
            resolve = function (data) {
                _this.clean(id);
                return res(data);
            };
            reject = function (error) {
                _this.clean(id);
                return rej(error);
            };
        });
        ctxt = {
            message: message,
            promise: promise,
            reject: reject,
            resolve: resolve,
        };
        this.contexts[message.$id] = ctxt;
        var timeout = options && options.timeout;
        if (timeout) {
            ctxt.timeout = setTimeout(function () {
                _this.timeout(id);
            }, timeout);
        }
        var prewait = options && options.prewait;
        if (prewait) {
            prewait.catch(function (error) {
                _this.failed(id, error);
            });
        }
        return ctxt.promise;
    };
    ServMessageContextManager.prototype.has = function (id) {
        return !!this.contexts[id];
    };
    ServMessageContextManager.prototype.get = function (id) {
        var ctxt = this.contexts[id];
        return ctxt ? ctxt.message : undefined;
    };
    ServMessageContextManager.prototype.getPromise = function (id) {
        var ctxt = this.contexts[id];
        return ctxt ? ctxt.promise : undefined;
    };
    ServMessageContextManager.prototype.succeed = function (id, data) {
        var ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }
        ctxt.resolve(data);
        return true;
    };
    ServMessageContextManager.prototype.failed = function (id, error) {
        var ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }
        error = error || new Error('unknown');
        ctxt.reject(error);
        return true;
    };
    ServMessageContextManager.prototype.timeout = function (id, error) {
        var ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }
        error = error || new Error('timeout');
        ctxt.reject(error);
        return true;
    };
    ServMessageContextManager.prototype.clean = function (id) {
        var ctxt = this.contexts[id];
        if (!ctxt) {
            return false;
        }
        delete this.contexts[id];
        if (ctxt.timeout) {
            clearTimeout(ctxt.timeout);
        }
        return true;
    };
    return ServMessageContextManager;
}());
exports.ServMessageContextManager = ServMessageContextManager;
//# sourceMappingURL=ServMessageContextManager.js.map