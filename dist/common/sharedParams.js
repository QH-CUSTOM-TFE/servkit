"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.popSharedParams = exports.delSharedParams = exports.getSharedParams = exports.putSharedParams = exports.delParamsPool = exports.getParamsPool = void 0;
var target = Date.prototype.getTime;
var sharedParams = target.__$servkit_sharedParams;
if (!sharedParams) {
    sharedParams = {};
    target.__$servkit_sharedParams = sharedParams;
}
var DEFAULT_SERVKIT_NAMESPACE = '__DEFAULT_SERVKIT__';
function getParamsPool(servkit, create) {
    var namesapce = servkit.namespace || DEFAULT_SERVKIT_NAMESPACE;
    var pool = sharedParams[namesapce];
    if (!pool && create) {
        pool = {};
        sharedParams[namesapce] = pool;
    }
    return pool;
}
exports.getParamsPool = getParamsPool;
function delParamsPool(servkit, create) {
    var namesapce = servkit.namespace || DEFAULT_SERVKIT_NAMESPACE;
    delete sharedParams[namesapce];
}
exports.delParamsPool = delParamsPool;
function putSharedParams(servkit, key, params) {
    var pool = getParamsPool(servkit, true);
    pool[key] = params;
}
exports.putSharedParams = putSharedParams;
function getSharedParams(servkit, key) {
    var pool = getParamsPool(servkit);
    return pool ? pool[key] : undefined;
}
exports.getSharedParams = getSharedParams;
function delSharedParams(servkit, key) {
    var pool = getParamsPool(servkit);
    if (pool) {
        delete pool[key];
    }
}
exports.delSharedParams = delSharedParams;
function popSharedParams(servkit, key) {
    var params = getSharedParams(servkit, key);
    if (params !== undefined) {
        delSharedParams(servkit, key);
    }
    return params;
}
exports.popSharedParams = popSharedParams;
//# sourceMappingURL=sharedParams.js.map