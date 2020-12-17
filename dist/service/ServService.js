"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = exports.anno = exports.EServImplInject = exports.ServService = exports.API_SUCCEED = exports.API_ERROR = exports.API_UNSUPPORT = void 0;
var common_1 = require("../common/common");
var DEFAULT_SERV_API_OPTIONS = {};
var DEFAULT_NOTIFY_API_OPTIONS = { dontRetn: true };
var DEFAULT_SERV_EVENTER_OPTIONS = {};
exports.API_UNSUPPORT = function () { return Promise.reject(new Error('unsupport')); };
exports.API_ERROR = function (error) { return Promise.reject(error || new Error('unknown')); };
function API_SUCCEED(data) {
    return Promise.resolve(data);
}
exports.API_SUCCEED = API_SUCCEED;
var ServService = /** @class */ (function () {
    function ServService() {
    }
    ServService.prototype.meta = function () {
        return meta(this);
    };
    ServService.meta = function () {
        return meta(this);
    };
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
                common_1.asyncThrowMessage("The Service should extends from ServService.");
                return;
            }
            var metas = meta(cls, true);
            if (!metas) {
                common_1.asyncThrowMessage("Invalid Service class.");
                return;
            }
            if (!options.id) {
                throw new Error('[SERVKIT] id is empty in service declaration');
            }
            if (!options.version) {
                throw new Error("[SERVKIT] version is empty in " + options.id + " service declaration");
            }
            metas.id = options.id;
            metas.version = options.version;
            metas.ACL = options.ACL;
            metas.EXT = options.EXT;
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
    };
});
var impl = (function (options) {
    return function (cls) {
        try {
            if (!cls.IS_SERV_SERVICE) {
                common_1.asyncThrowMessage("The Service should extends from ServService.");
                return;
            }
            var metas = meta(cls);
            if (!metas) {
                common_1.asyncThrowMessage("Invalid Service class.");
                return;
            }
            var proto_1 = cls.prototype;
            metas.apis.forEach(function (item) {
                if (!proto_1.hasOwnProperty(item.name)) {
                    common_1.asyncThrowMessage("The service impl forget to implement api [" + item.name + "].");
                }
            });
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
    };
});
function api(options) {
    return function (proto, propKey) {
        try {
            var metas = meta(proto, true);
            if (!metas) {
                common_1.asyncThrowMessage("Can't get meta in api [" + propKey + "].");
                return;
            }
            var apis = metas.apis;
            for (var i = 0, iz = apis.length; i < iz; ++i) {
                if (apis[i].name === propKey) {
                    common_1.asyncThrowMessage("Api conflicts [" + propKey + "].");
                    return;
                }
            }
            var item = {
                name: propKey,
                options: DEFAULT_SERV_API_OPTIONS,
            };
            if (options) {
                item.options = options;
            }
            apis.push(item);
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
    };
}
function notify(options) {
    return function (proto, propKey) {
        try {
            var metas = meta(proto, true);
            if (!metas) {
                common_1.asyncThrowMessage("Can't get meta in api [" + propKey + "].");
                return;
            }
            var apis = metas.apis;
            for (var i = 0, iz = apis.length; i < iz; ++i) {
                if (apis[i].name === propKey) {
                    common_1.asyncThrowMessage("Api conflicts [" + propKey + "].");
                    return;
                }
            }
            var item = {
                name: propKey,
                options: DEFAULT_NOTIFY_API_OPTIONS,
            };
            if (options) {
                item.options = options;
                item.options.dontRetn = true;
            }
            apis.push(item);
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
    };
}
function event(options) {
    return function (proto, propKey) {
        try {
            var metas = meta(proto, true);
            if (!metas) {
                common_1.asyncThrowMessage("Can't get meta in event [" + propKey + "].");
                return;
            }
            var events = metas.evts;
            for (var i = 0, iz = events.length; i < iz; ++i) {
                if (events[i].name === propKey) {
                    common_1.asyncThrowMessage("Event conflicts [" + propKey + "].");
                    return;
                }
            }
            var item = {
                name: propKey,
                options: DEFAULT_SERV_EVENTER_OPTIONS,
            };
            if (options) {
                item.options = options;
            }
            events.push(item);
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
    };
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
        common_1.asyncThrowMessage('Get meta from an invalid serv target!');
    }
    catch (e) {
        common_1.asyncThrow(e);
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
        common_1.asyncThrowMessage('Get meta from an invalid impl target!');
    }
    catch (e) {
        common_1.asyncThrow(e);
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
                common_1.asyncThrowMessage("Can't get impl metas in inject [" + propKey + "].");
                return;
            }
            metas.injects[type] = {
                type: type,
                name: propKey,
            };
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
    };
}
decl.api = api;
decl.event = event;
decl.notify = notify;
impl.inject = implInject;
exports.anno = {
    decl: decl,
    impl: impl,
};
exports.util = {
    implMeta: implMeta,
};
//# sourceMappingURL=ServService.js.map