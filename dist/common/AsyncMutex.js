"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncMutex = void 0;
var Deferred_1 = require("./Deferred");
var AsyncMutex = /** @class */ (function () {
    function AsyncMutex(options) {
        this.lockMax = Math.min((options && options.max) || 1, 1);
        this.lockQueue = [];
    }
    AsyncMutex.prototype.lock = function () {
        var _this = this;
        var lock = {
            deferred: Deferred_1.DeferredUtil.create(),
            unlock: function () {
                var i = _this.lockQueue.indexOf(lock);
                if (i >= 0) {
                    _this.lockQueue.splice(i, 1);
                }
                _this.tryLock();
            },
        };
        this.lockQueue.push(lock);
        this.tryLock();
        return lock.deferred;
    };
    AsyncMutex.prototype.lockGuard = function (func) {
        var self = this;
        var newFunc = function () {
            var _this = this;
            var args = Array.prototype.slice.apply(arguments);
            return self.lock().then(function (unlock) {
                var ret;
                try {
                    ret = func.apply(_this, args);
                }
                catch (e) {
                    ret = Promise.reject(e);
                }
                unlock();
                return ret;
            });
        };
        return newFunc;
    };
    AsyncMutex.prototype.tryLock = function () {
        if (this.lockMax === 1) {
            var lock = this.lockQueue[0];
            if (lock && !lock.deferred.isFinished()) {
                lock.deferred.resolve(lock.unlock);
            }
        }
        else {
            for (var i = 0, iz = this.lockMax; i < iz; ++i) {
                var lock = this.lockQueue[i];
                if (lock && !lock.deferred.isFinished()) {
                    lock.deferred.resolve(lock.unlock);
                }
            }
        }
    };
    return AsyncMutex;
}());
exports.AsyncMutex = AsyncMutex;
//# sourceMappingURL=AsyncMutex.js.map