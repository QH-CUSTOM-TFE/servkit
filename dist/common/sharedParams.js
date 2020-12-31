"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAsyncLoadDeclContext = exports.getAsyncLoadDeclContext = exports.putAsyncLoadDeclContext = exports.delAsyncLoadStartParams = exports.getAsyncLoadStartParams = exports.putAsyncLoadStartParams = exports.popSharedParams = exports.delSharedParams = exports.getSharedParams = exports.putSharedParams = void 0;
var Servkit_1 = require("../servkit/Servkit");
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
function delParamsPool(servkit, create) {
    var namesapce = servkit.namespace || DEFAULT_SERVKIT_NAMESPACE;
    delete sharedParams[namesapce];
}
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
function startParamsKey(id) {
    return id + "-startParams";
}
function declContextKey(id) {
    return id + "-declContext";
}
function putAsyncLoadStartParams(appId, params) {
    return putSharedParams(Servkit_1.servkit, startParamsKey(appId), params);
}
exports.putAsyncLoadStartParams = putAsyncLoadStartParams;
function getAsyncLoadStartParams(appId) {
    return getSharedParams(Servkit_1.servkit, startParamsKey(appId));
}
exports.getAsyncLoadStartParams = getAsyncLoadStartParams;
function delAsyncLoadStartParams(appId) {
    return delSharedParams(Servkit_1.servkit, startParamsKey(appId));
}
exports.delAsyncLoadStartParams = delAsyncLoadStartParams;
function putAsyncLoadDeclContext(appId, context) {
    return putSharedParams(Servkit_1.servkit, declContextKey(appId), context);
}
exports.putAsyncLoadDeclContext = putAsyncLoadDeclContext;
function getAsyncLoadDeclContext(appId) {
    return getSharedParams(Servkit_1.servkit, declContextKey(appId));
}
exports.getAsyncLoadDeclContext = getAsyncLoadDeclContext;
function delAsyncLoadDeclContext(appId) {
    return delSharedParams(Servkit_1.servkit, declContextKey(appId));
}
exports.delAsyncLoadDeclContext = delAsyncLoadDeclContext;
//# sourceMappingURL=sharedParams.js.map