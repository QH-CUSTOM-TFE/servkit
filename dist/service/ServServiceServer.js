"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServServiceServer = void 0;
var index_1 = require("../common/index");
var creator_1 = require("../message/creator");
var type_1 = require("../message/type");
var ServServiceManager_1 = require("./ServServiceManager");
var ServServiceServer = /** @class */ (function () {
    function ServServiceServer(terminal) {
        var _this = this;
        this.onRecvMessage = function (message) {
            // Only care about 'service message'
            if (!creator_1.ServServiceMessageCreator.isServiceMessage(message)) {
                return false;
            }
            var servMessage = message;
            if (creator_1.ServServiceMessageCreator.isAPIMessage(servMessage)) {
                return _this.handleAPIMessage(servMessage);
            }
            if (creator_1.ServServiceMessageCreator.isGetVersionMessage(servMessage)) {
                return _this.handleGetVesionMessage(servMessage);
            }
            return false;
        };
        this.onEventerEmit = function (serviceId, event, args) {
            if (_this.ACLResolver) {
                var service = _this.getServiceByID(serviceId);
                if (!service) {
                    index_1.logACL(_this, "Event denied because of server ACL, [" + serviceId + "][" + event + "]");
                    return;
                }
                var meta = service.meta();
                if (!meta || !_this.ACLResolver.canAccessService(_this, meta)) {
                    index_1.logACL(_this, "Event denied because of server ACL, [" + serviceId + "][" + event + "]");
                    return;
                }
                else {
                    var evtMeta = meta.evts.find(function (item) { return item.name === event; });
                    if (!evtMeta || !_this.ACLResolver.canAccessEventer(_this, meta, evtMeta)) {
                        index_1.logACL(_this, "Event denied because of event ACL, [" + serviceId + "][" + event + "]");
                        return;
                    }
                }
            }
            var message = creator_1.ServServiceMessageCreator.createEvent(serviceId, event, args);
            return _this.sendMessage(message).catch(function () { return undefined; });
        };
        this.terminal = terminal;
    }
    ServServiceServer.prototype.init = function (config) {
        config = config || {};
        this.serviceManager = new ServServiceManager_1.ServServiceManager();
        this.serviceManager.init(config.service);
        this.serviceManager.onEvnterEmit = this.onEventerEmit;
        this.ACLResolver = config.ACLResolver;
        if (config.serviceRefer) {
            this.serviceRefer = this.terminal.servkit.service.referServices(config.serviceRefer);
            this.serviceRefer.onEvnterEmit = this.onEventerEmit;
        }
        this.sessionUnlisten = this.terminal.session.onRecvMessage(this.onRecvMessage);
    };
    ServServiceServer.prototype.release = function () {
        if (this.sessionUnlisten) {
            this.sessionUnlisten();
            this.sessionUnlisten = undefined;
        }
        if (this.serviceRefer) {
            this.serviceRefer.detach();
            this.serviceRefer = undefined;
        }
        this.serviceManager.release();
        delete this.ACLResolver;
    };
    ServServiceServer.prototype.getService = function () {
        if (arguments.length === 0) {
            return;
        }
        var decls = arguments[0];
        if (typeof decls === 'function') {
            return this._getService(decls);
        }
        else {
            var keys = Object.keys(decls);
            var services = {};
            for (var i = 0, iz = keys.length; i < iz; ++i) {
                services[keys[i]] = this._getService(decls[keys[i]]);
            }
            return services;
        }
    };
    ServServiceServer.prototype.getServiceUnsafe = function () {
        return this.getService.apply(this, arguments);
    };
    ServServiceServer.prototype.service = function () {
        if (arguments.length === 0) {
            return Promise.reject(new Error('[SERVKIT] Decl is empty'));
        }
        var services = this.serviceExec(arguments[0], function (v) {
            return v;
        });
        return services ? Promise.resolve(services) : Promise.reject(new Error('[SAPPSDK] Get a undefined service'));
    };
    ServServiceServer.prototype.serviceExec = function () {
        if (arguments.length < 2) {
            return null;
        }
        var decls = arguments[0];
        var exec = arguments[1];
        if (typeof decls === 'function') {
            var service = this._getService(decls);
            if (!service) {
                return null;
            }
            return exec(service);
        }
        else {
            var keys = Object.keys(decls);
            var services = {};
            for (var i = 0, iz = keys.length; i < iz; ++i) {
                var service = this._getService(decls[keys[i]]);
                if (!service) {
                    return null;
                }
                services[keys[i]] = service;
            }
            return exec.apply(window, services);
        }
    };
    ServServiceServer.prototype.serviceExecByID = function (id, exec) {
        var service = this.getServiceByID(id);
        if (!service) {
            return null;
        }
        return exec(service);
    };
    ServServiceServer.prototype.getServiceByID = function (id) {
        var service = this.serviceManager.getServiceByID(id);
        if (!service) {
            service = this.serviceRefer ? this.serviceRefer.getServiceByID(id) : undefined;
        }
        return service;
    };
    ServServiceServer.prototype._getService = function (decl) {
        var meta = decl.meta();
        if (!meta) {
            return;
        }
        return this.getServiceByID(meta.id);
    };
    ServServiceServer.prototype.addService = function (decl, impl, options) {
        return this.serviceManager.addService(decl, impl, options);
    };
    ServServiceServer.prototype.addServices = function (items, options) {
        this.serviceManager.addServices(items, options);
    };
    ServServiceServer.prototype.handleAPIMessage = function (message) {
        var id = message.service;
        var service = this.getServiceByID(id);
        var retnPromise;
        if (!service) {
            retnPromise = Promise.reject("Unknown service [" + id + "]");
        }
        else {
            var api_1 = message.api;
            var meta = service.meta();
            var apiMeta_1 = meta.apis.find(function (item) { return item.name === api_1; });
            if (typeof service[api_1] !== 'function') {
                retnPromise = Promise.reject("Unknown api [" + api_1 + "] in service " + id);
            }
            else {
                try {
                    if (this.ACLResolver) {
                        if (!this.ACLResolver.canAccessService(this, meta)) {
                            index_1.logACL(this, "API denied because of server ACL, [" + id + "][" + api_1 + "]");
                            // tslint:disable-next-line:no-string-throw
                            throw "Access service " + id + " denied";
                        }
                        else if (!this.ACLResolver.canAccessAPI(this, meta, apiMeta_1)) {
                            index_1.logACL(this, "API denied because of api ACL, [" + id + "][" + api_1 + "]");
                            // tslint:disable-next-line:no-string-throw
                            throw "Access api " + api_1 + " denied in service " + id;
                        }
                    }
                    var args = message.args;
                    if (apiMeta_1 && apiMeta_1.options && apiMeta_1.options.onCallTransform) {
                        args = apiMeta_1.options.onCallTransform.recv(args);
                    }
                    retnPromise = Promise.resolve(service[api_1](args));
                    if (apiMeta_1 && apiMeta_1.options && apiMeta_1.options.onRetnTransform) {
                        retnPromise = retnPromise.then(function (data) {
                            data = apiMeta_1.options.onRetnTransform.send(data);
                            return data;
                        });
                    }
                }
                catch (e) {
                    retnPromise = Promise.reject(e);
                }
            }
            if (apiMeta_1 && apiMeta_1.options && apiMeta_1.options.dontRetn) {
                return true;
            }
        }
        this.sendReturnMessage(retnPromise, message, creator_1.ServServiceMessageCreator.createAPIReturn);
        return true;
    };
    ServServiceServer.prototype.handleGetVesionMessage = function (message) {
        var id = message.service;
        var service = this.getServiceByID(id);
        var retnPromise;
        if (!service) {
            retnPromise = Promise.reject("Unknown service [" + id + "]");
        }
        else {
            var meta = service.meta();
            retnPromise = Promise.resolve(meta.version);
        }
        this.sendReturnMessage(retnPromise, message, function (origin, data, error) {
            return creator_1.ServServiceMessageCreator.createReturn(origin, type_1.EServServiceMessage.GET_VERSION_RETURN, data, error);
        });
        return true;
    };
    ServServiceServer.prototype.sendReturnMessage = function (retnPromise, origin, retnCreator) {
        var _this = this;
        retnPromise.then(function (data) {
            var retnMesage = retnCreator(origin, data);
            _this.sendMessage(retnMesage);
        }, function (error) {
            var retnMesage = retnCreator(origin, undefined, error);
            _this.sendMessage(retnMesage);
        });
    };
    ServServiceServer.prototype.sendMessage = function (message) {
        return this.terminal.session.sendMessage(message);
    };
    return ServServiceServer;
}());
exports.ServServiceServer = ServServiceServer;
//# sourceMappingURL=ServServiceServer.js.map