"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = exports.anno = exports.EServImplInject = exports.ServService = exports.API_SUCCEED = exports.API_ERROR = exports.API_UNSUPPORT = void 0;
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
        if (!cls.IS_SERV_SERVICE) {
            throw new Error("[SERVKIT] The Service should extends from ServService.");
        }
        var metas = meta(cls, true);
        if (!metas) {
            throw new Error("[SERVKIT] Invalid Service class.");
        }
        metas.id = options.id;
        metas.version = options.version;
    };
});
var impl = (function (options) {
    return function (cls) {
        if (!cls.IS_SERV_SERVICE) {
            throw new Error("[SERVKIT] The Service should extends from ServService.");
        }
        var metas = meta(cls);
        if (!metas) {
            throw new Error("[SERVKIT] Invalid Service class.");
        }
        var proto = cls.prototype;
        metas.apis.forEach(function (item) {
            if (!proto.hasOwnProperty(item.name)) {
                throw new Error("[SERVKIT] The service impl forget to implement api [" + item.name + "].");
            }
        });
    };
});
function apiDecorate(proto, propKey) {
    var metas = meta(proto, true);
    if (!metas) {
        throw new Error("[SERVKIT] Can't get meta in api [" + propKey + "].");
    }
    var apis = metas.apis;
    for (var i = 0, iz = apis.length; i < iz; ++i) {
        if (apis[i].name === propKey) {
            throw new Error("[SERVKIT] Api conflicts [" + propKey + "].");
        }
    }
    apis.push({
        name: propKey,
    });
}
function api() {
    return apiDecorate;
}
function eventDecorate(proto, propKey) {
    var metas = meta(proto, true);
    if (!metas) {
        throw new Error("[SERVKIT] Can't get meta in event [" + propKey + "].");
    }
    var events = metas.evts;
    for (var i = 0, iz = events.length; i < iz; ++i) {
        if (events[i].name === propKey) {
            throw new Error("[SERVKIT] Event conflicts [" + propKey + "].");
        }
    }
    events.push({
        name: propKey,
    });
}
function event() {
    return eventDecorate;
}
function meta(obj, create) {
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
    throw new Error('[SERVKIT] Get meta from an invalid serv target!');
}
var IMPL = '__serv_service_impl_meta';
function implMeta(obj, create) {
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
    throw new Error('[SERVKIT] Get meta from an invalid impl target!');
}
var EServImplInject;
(function (EServImplInject) {
    EServImplInject[EServImplInject["NULL"] = 0] = "NULL";
    EServImplInject[EServImplInject["GET_SERVICE"] = 1] = "GET_SERVICE";
})(EServImplInject = exports.EServImplInject || (exports.EServImplInject = {}));
function implInject(type) {
    return function (proto, propKey) {
        var metas = implMeta(proto, true);
        if (!metas) {
            throw new Error("[SERVKIT] Can't get impl metas in inject [" + propKey + "].");
        }
        metas.injects[type] = {
            type: type,
            name: propKey,
        };
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