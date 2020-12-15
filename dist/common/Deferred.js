"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeferredUtil = exports.EDeferredResult = void 0;
var EDeferredResult;
(function (EDeferredResult) {
    EDeferredResult[EDeferredResult["NONE"] = 0] = "NONE";
    EDeferredResult[EDeferredResult["RESOLVED"] = 1] = "RESOLVED";
    EDeferredResult[EDeferredResult["REJECTED"] = 2] = "REJECTED";
    EDeferredResult[EDeferredResult["TIMEOUT"] = 3] = "TIMEOUT";
})(EDeferredResult = exports.EDeferredResult || (exports.EDeferredResult = {}));
var DeferredImpl = /** @class */ (function () {
    function DeferredImpl(options) {
        var _this = this;
        this.resolve = function (data) {
            _this.clearTimeout();
            if (_this.isFinished()) {
                return;
            }
            _this._finishedResult = EDeferredResult.RESOLVED;
            return _this._resolve(data);
        };
        this.reject = function (error) {
            _this.clearTimeout();
            if (_this.isFinished()) {
                return;
            }
            _this._finishedResult = EDeferredResult.REJECTED;
            return _this._reject(error);
        };
        this.timeout = function () {
            _this._timeoutTimer = 0;
            if (_this.isFinished()) {
                return;
            }
            _this._finishedResult = EDeferredResult.TIMEOUT;
            _this._reject(new Error('timeout'));
        };
        this.isFinished = function () {
            return _this._finishedResult;
        };
        this.createDeferred(new Promise(function (res, rej) {
            _this._resolve = res;
            _this._reject = rej;
        }));
        if (options && options.timeout && options.timeout > 0) {
            this.startTimeout(options.timeout);
        }
        if (options && options.rejectIf) {
            options.rejectIf.catch(function (error) {
                _this.reject(error);
            });
        }
        if (options && options.resolveIf) {
            options.resolveIf.then(function () {
                _this.resolve();
            }, function (error) {
                _this.reject(error);
            });
        }
    }
    DeferredImpl.prototype.startTimeout = function (timeout) {
        var _this = this;
        this.clearTimeout();
        this._timeoutTimer = setTimeout(function () {
            _this.timeout();
        }, timeout);
    };
    DeferredImpl.prototype.clearTimeout = function () {
        if (this._timeoutTimer) {
            clearTimeout(this._timeoutTimer);
            this._timeoutTimer = 0;
        }
    };
    DeferredImpl.prototype.createDeferred = function (promise) {
        var deferred = promise;
        deferred.resolve = this.resolve;
        deferred.reject = this.reject;
        deferred.isFinished = this.isFinished;
        this.deferred = deferred;
    };
    return DeferredImpl;
}());
var DeferredUtil = /** @class */ (function () {
    function DeferredUtil() {
    }
    DeferredUtil.create = function (options) {
        var impl = new DeferredImpl(options);
        return impl.deferred;
    };
    DeferredUtil.resolve = function (data) {
        var ret = DeferredUtil.create();
        ret.resolve(data);
        return ret;
    };
    DeferredUtil.reject = function (error) {
        var ret = DeferredUtil.create();
        ret.reject(error);
        return ret;
    };
    DeferredUtil.reEntryGuard = function (func, options) {
        var newFunc = function () {
            if (newFunc.deferred) {
                return newFunc.deferred;
            }
            var deferred = DeferredUtil.create(options);
            newFunc.deferred = deferred;
            deferred.then(function () {
                newFunc.deferred = undefined;
            }, function () {
                newFunc.deferred = undefined;
            });
            try {
                Promise.resolve(func.apply(this, arguments)).then(function (val) {
                    deferred.resolve(val);
                }, function (err) {
                    deferred.reject(err);
                });
            }
            catch (e) {
                deferred.reject(e);
            }
            return deferred;
        };
        return newFunc;
    };
    return DeferredUtil;
}());
exports.DeferredUtil = DeferredUtil;
//# sourceMappingURL=Deferred.js.map