"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = exports.anno = exports.EServImplInject = exports.ServService = exports.API_SUCCEED = exports.API_ERROR = exports.API_UNSUPPORT = void 0;
var index_1 = require("../common/index");
exports.API_UNSUPPORT = function () { return Promise.reject(new Error('unsupport')); };
exports.API_ERROR = function (error) { return Promise.reject(error || 'error'); };
exports.API_SUCCEED = function (data) { return Promise.resolve(data); };
var ServService = /** @class */ (function () {
    function ServService() {
    }
    return ServService;
}());
exports.ServService = ServService;
ServService.IS_SERV_SERVICE = true;
ServService.prototype.IS_SERV_SERVICE = true;
var META = '__serv_service_meta';
var decl = (function (options) {
    return function (cls) {
        try {
            if (!cls.IS_SERV_SERVICE) {
                index_1.asyncThrowMessage("The Service should extends from ServService.");
                return;
            }
            var metas = meta(cls, true);
            if (!metas) {
                index_1.asyncThrowMessage("Invalid Service class.");
                return;
            }
            metas.id = options.id;
            metas.version = options.version;
        }
        catch (e) {
            index_1.asyncThrow(e);
        }
    };
});
var impl = (function (options) {
    return function (cls) {
        try {
            if (!cls.IS_SERV_SERVICE) {
                index_1.asyncThrowMessage("The Service should extends from ServService.");
                return;
            }
            var metas = meta(cls);
            if (!metas) {
                index_1.asyncThrowMessage("Invalid Service class.");
                return;
            }
            var proto_1 = cls.prototype;
            metas.apis.forEach(function (item) {
                if (!proto_1.hasOwnProperty(item.name)) {
                    index_1.asyncThrowMessage("The service impl forget to implement api [" + item.name + "].");
                }
            });
        }
        catch (e) {
            index_1.asyncThrow(e);
        }
    };
});
function apiDecorate(proto, propKey) {
    try {
        var metas = meta(proto, true);
        if (!metas) {
            index_1.asyncThrowMessage("Can't get meta in api [" + propKey + "].");
            return;
        }
        var apis = metas.apis;
        for (var i = 0, iz = apis.length; i < iz; ++i) {
            if (apis[i].name === propKey) {
                index_1.asyncThrowMessage("Api conflicts [" + propKey + "].");
                return;
            }
        }
        apis.push({
            name: propKey,
        });
    }
    catch (e) {
        index_1.asyncThrow(e);
    }
}
function api() {
    return apiDecorate;
}
function eventDecorate(proto, propKey) {
    try {
        var metas = meta(proto, true);
        if (!metas) {
            index_1.asyncThrowMessage("Can't get meta in event [" + propKey + "].");
            return;
        }
        var events = metas.evts;
        for (var i = 0, iz = events.length; i < iz; ++i) {
            if (events[i].name === propKey) {
                index_1.asyncThrowMessage("Event conflicts [" + propKey + "].");
                return;
            }
        }
        events.push({
            name: propKey,
        });
    }
    catch (e) {
        index_1.asyncThrow(e);
    }
}
function event() {
    return eventDecorate;
}
function meta(obj, create) {
    try {
        var ret = obj[META];
        if (ret) {
            return ret;
        }
        if (typeof obj === 'function') {
            ret = obj.prototype[META];
            if (!ret && create) {
                ret = {
                    id: '',
                    version: '',
                    apis: [],
                    evts: [],
                };
                obj.prototype[META] = ret;
            }
            return ret;
        }
        else if (create && typeof obj === 'object' && obj.IS_SERV_SERVICE) {
            // Prototype of Interface
            ret = {
                id: '',
                version: '',
                apis: [],
                evts: [],
            };
            obj[META] = ret;
            return ret;
        }
        index_1.asyncThrowMessage('Get meta from an invalid serv target!');
    }
    catch (e) {
        index_1.asyncThrow(e);
    }
}
var IMPL = '__serv_service_impl_meta';
function implMeta(obj, create) {
    try {
        var ret = obj[IMPL];
        if (ret) {
            return ret;
        }
        if (typeof obj === 'function') {
            ret = obj.prototype[IMPL];
            if (!ret && create) {
                ret = {
                    injects: {},
                };
                obj.prototype[IMPL] = ret;
            }
            return ret;
        }
        else if (create && typeof obj === 'object' && obj.IS_SERV_SERVICE) {
            // Prototype of Interface
            ret = {
                injects: {},
            };
            obj[IMPL] = ret;
            return ret;
        }
        index_1.asyncThrowMessage('Get meta from an invalid impl target!');
    }
    catch (e) {
        index_1.asyncThrow(e);
    }
}
var EServImplInject;
(function (EServImplInject) {
    EServImplInject[EServImplInject["NULL"] = 0] = "NULL";
    EServImplInject[EServImplInject["GET_SERVICE"] = 1] = "GET_SERVICE";
})(EServImplInject = exports.EServImplInject || (exports.EServImplInject = {}));
function implInject(type) {
    return function (proto, propKey) {
        try {
            var metas = implMeta(proto, true);
            if (!metas) {
                index_1.asyncThrowMessage("Can't get impl metas in inject [" + propKey + "].");
                return;
            }
            metas.injects[type] = {
                type: type,
                name: propKey,
            };
        }
        catch (e) {
            index_1.asyncThrow(e);
        }
    };
}
decl.api = api;
decl.event = event;
impl.inject = implInject;
exports.anno = {
    decl: decl,
    impl: impl,
};
exports.util = {
    meta: meta,
    implMeta: implMeta,
};
//# sourceMappingURL=ServService.js.map