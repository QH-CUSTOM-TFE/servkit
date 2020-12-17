"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aspectAfter = exports.aspectBefore = exports.aspect = void 0;
var common_1 = require("./common");
function aspect(obj, fn, beforeImpl, afterImpl) {
    var oldFn = obj[fn];
    var newFn = function () {
        // Do before aspect
        if (beforeImpl) {
            try {
                beforeImpl.call(this);
            }
            catch (e) {
                common_1.asyncThrow(e);
            }
        }
        var ret = oldFn.apply(this, arguments);
        // Do after aspect
        if (afterImpl) {
            try {
                afterImpl.call(this, ret);
            }
            catch (e) {
                common_1.asyncThrow(e);
            }
        }
        return ret;
    };
    obj[fn] = newFn;
    newFn.__aopOld = oldFn;
}
exports.aspect = aspect;
function aspectBefore(obj, fn, impl) {
    aspect(obj, fn, impl, undefined);
}
exports.aspectBefore = aspectBefore;
function aspectAfter(obj, fn, impl) {
    aspect(obj, fn, undefined, impl);
}
exports.aspectAfter = aspectAfter;
//# sourceMappingURL=aspect.js.map