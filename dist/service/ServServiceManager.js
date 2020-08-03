"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServServiceManager = exports.ServServiceRefer = void 0;
var index_1 = require("../common/index");
var ServEventerManager_1 = require("./event/ServEventerManager");
var ServService_1 = require("./ServService");
var ServServiceRefer = /** @class */ (function () {
    function ServServiceRefer(manager, pattern) {
        this.manager = manager;
        this.pattern = pattern;
        this.manager.onReferAttach(this);
    }
    ServServiceRefer.prototype.canRefer = function (service) {
        if (!this.pattern || !this.manager) {
            return false;
        }
        if (Array.isArray(this.pattern)) {
            var ptns = this.pattern;
            var type = void 0;
            var ptn = void 0;
            for (var i = 0, iz = ptns.length; i < iz; ++i) {
                ptn = ptns[i];
                type = typeof ptn;
                if (type === 'function' && ptn(service)) {
                    return true;
                }
                else if (type === 'string' && ptn === service) {
                    return true;
                }
                else if (ptn instanceof RegExp && ptn.test(service)) {
                    return true;
                }
            }
        }
        else {
            var ptn = this.pattern;
            var type = typeof ptn;
            if (type === 'function' && ptn(service)) {
                return true;
            }
            else if (type === 'string' && ptn === service) {
                return true;
            }
            else if (ptn instanceof RegExp && ptn.test(service)) {
                return true;
            }
        }
        return false;
    };
    ServServiceRefer.prototype.getServiceByID = function (id) {
        if (!this.canRefer(id)) {
            return;
        }
        return this.manager.getServiceByID(id);
    };
    ServServiceRefer.prototype.getService = function (decl) {
        var meta = ServService_1.util.meta(decl);
        if (!meta) {
            return;
        }
        return this.getServiceByID(meta.id);
    };
    ServServiceRefer.prototype.rawEmit = function (service, event, args) {
        if (!this.canRefer(service)) {
            return;
        }
        this.manager.rawEmit(service, event, args);
    };
    ServServiceRefer.prototype.setPattern = function (pattern) {
        this.pattern = pattern;
    };
    ServServiceRefer.prototype.detach = function () {
        this.manager.onReferDetach(this);
        this.pattern = undefined;
        this.manager = undefined;
        this.onEvnterEmit = undefined;
    };
    ServServiceRefer.prototype._onEventerEmit = function (service, event, args) {
        if (!this.onEvnterEmit || !this.canRefer(service)) {
            return;
        }
        this.onEvnterEmit(service, event, args);
    };
    return ServServiceRefer;
}());
exports.ServServiceRefer = ServServiceRefer;
var ServServiceManager = /** @class */ (function () {
    function ServServiceManager() {
        var _this = this;
        this.injGetService = function (decl) {
            return _this.getService(decl);
        };
        this._onEventerEmit = function (eventer, args) {
            if (_this.onEvnterEmit) {
                try {
                    _this.onEvnterEmit(eventer.service, eventer.event, args);
                }
                catch (e) {
                    index_1.asyncThrow(e);
                }
            }
            var refers = _this.refers;
            for (var i = 0, iz = refers.length; i < iz; ++i) {
                try {
                    refers[i]._onEventerEmit(eventer.service, eventer.event, args);
                }
                catch (e) {
                    index_1.asyncThrow(e);
                }
            }
            return Promise.resolve();
        };
    }
    ServServiceManager.prototype.init = function (config) {
        this.services = {};
        this.serviceInfos = {};
        this.eventerManager = new ServEventerManager_1.ServEventerManager();
        this.eventerManager.init(this._onEventerEmit);
        this.refers = [];
        if (config && config.services) {
            this.addServices(config.services);
        }
    };
    ServServiceManager.prototype.release = function () {
        this.onEvnterEmit = undefined;
        this.refers.forEach(function (item) {
            item.detach();
        });
        this.refers = [];
        this.eventerManager.release();
        this.services = {};
        this.serviceInfos = {};
    };
    ServServiceManager.prototype.getServiceByID = function (id) {
        var service = this.services[id];
        if (service) {
            return service;
        }
        var info = this.serviceInfos[id];
        if (!info) {
            return undefined;
        }
        return this.getService(info.decl);
    };
    ServServiceManager.prototype.getService = function (decl) {
        var metas = ServService_1.util.meta(decl);
        if (!metas) {
            return;
        }
        var id = metas.id;
        var service = this.services[id];
        if (!service) {
            var info = this.serviceInfos[id];
            if (!info) {
                return;
            }
            service = this.generateService(info);
            this.services[id] = service;
        }
        return service;
    };
    ServServiceManager.prototype.serviceExecByID = function (id, exec) {
        var service = this.getServiceByID(id);
        if (!service) {
            return null;
        }
        return exec(service);
    };
    ServServiceManager.prototype.serviceExec = function (decl, exec) {
        var service = this.getService(decl);
        if (!service) {
            return null;
        }
        return exec(service);
    };
    ServServiceManager.prototype.addService = function (decl, impl, options) {
        var meta = ServService_1.util.meta(decl);
        if (!meta) {
            return false;
        }
        if (ServService_1.util.meta(impl) !== meta) {
            return false;
        }
        var info = this.serviceInfos[meta.id];
        if (info) {
            return false;
        }
        info = {
            meta: meta,
            decl: decl,
            impl: impl,
        };
        this.serviceInfos[meta.id] = info;
        var lazy = (options && options.lazy) === true || false;
        if (!lazy) {
            var service = this.generateService(info);
            this.services[meta.id] = service;
        }
        return true;
    };
    ServServiceManager.prototype.addServices = function (items, options) {
        var _this = this;
        items.forEach(function (item) {
            var opts = options;
            if (item.options) {
                opts = opts ? Object.assign({}, options, item.options) : item.options;
            }
            _this.addService(item.decl, item.impl, opts);
        });
    };
    ServServiceManager.prototype.remService = function (decl) {
        var meta = ServService_1.util.meta(decl);
        if (!meta) {
            return false;
        }
        var info = this.serviceInfos[meta.id];
        if (!info) {
            return false;
        }
        delete this.serviceInfos[meta.id];
        delete this.services[meta.id];
        return true;
    };
    ServServiceManager.prototype.remServices = function (decls) {
        var _this = this;
        decls.forEach(function (item) {
            _this.remService(item);
        });
    };
    ServServiceManager.prototype.referServices = function (pattern) {
        var refer = new ServServiceRefer(this, pattern);
        return refer;
    };
    ServServiceManager.prototype.rawEmit = function (service, event, args) {
        this.eventerManager.rawEmit(service, event, args);
    };
    ServServiceManager.prototype.generateService = function (info) {
        var _this = this;
        var obj = new info.impl();
        info.meta.evts.forEach(function (item) {
            obj[item.name] = _this.generateServiceEvent(info.meta.id, item.name);
        });
        var implMeta = ServService_1.util.implMeta(info.impl);
        if (implMeta) {
            var keys = Object.keys(implMeta.injects);
            for (var i = 0, iz = keys.length; i < iz; ++i) {
                var injInfo = implMeta.injects[keys[i]];
                if (injInfo.type === ServService_1.EServImplInject.GET_SERVICE) {
                    obj[injInfo.name] = this.injGetService;
                }
            }
        }
        return obj;
    };
    ServServiceManager.prototype.generateServiceEvent = function (service, event) {
        return this.eventerManager.spawn(service, event);
    };
    ServServiceManager.prototype.onReferAttach = function (refer) {
        var i = this.refers.indexOf(refer);
        if (i < 0) {
            this.refers.push(refer);
        }
    };
    ServServiceManager.prototype.onReferDetach = function (refer) {
        var i = this.refers.indexOf(refer);
        if (i >= 0) {
            this.refers.splice(i, 1);
        }
    };
    return ServServiceManager;
}());
exports.ServServiceManager = ServServiceManager;
//# sourceMappingURL=ServServiceManager.js.map