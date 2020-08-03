"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServServiceServer = void 0;
var creator_1 = require("../message/creator");
var ServService_1 = require("./ServService");
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
            return false;
        };
        this.onEventerEmit = function (service, event, args) {
            var message = creator_1.ServServiceMessageCreator.createEvent(service, event, args);
            return _this.sendMessage(message).catch(function () { return undefined; });
        };
        this.terminal = terminal;
    }
    ServServiceServer.prototype.init = function (config) {
        config = config || {};
        this.service = new ServServiceManager_1.ServServiceManager();
        this.service.init(config.service);
        this.service.onEvnterEmit = this.onEventerEmit;
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
        this.service.release();
    };
    ServServiceServer.prototype.serviceExec = function (decl, exec) {
        var service = this.getService(decl);
        if (!service) {
            return null;
        }
        return exec(service);
    };
    ServServiceServer.prototype.serviceExecByID = function (id, exec) {
        var service = this.getServiceByID(id);
        if (!service) {
            return null;
        }
        return exec(service);
    };
    ServServiceServer.prototype.getServiceByID = function (id) {
        var service = this.service.getServiceByID(id);
        if (!service) {
            service = this.serviceRefer ? this.serviceRefer.getServiceByID(id) : undefined;
        }
        return service;
    };
    ServServiceServer.prototype.getService = function (decl) {
        var meta = ServService_1.util.meta(decl);
        if (!meta) {
            return;
        }
        return this.getServiceByID(meta.id);
    };
    ServServiceServer.prototype.addService = function (decl, impl, options) {
        return this.service.addService(decl, impl, options);
    };
    ServServiceServer.prototype.addServices = function (items, options) {
        this.service.addServices(items, options);
    };
    ServServiceServer.prototype.handleAPIMessage = function (message) {
        var id = message.service;
        var service = this.getServiceByID(id);
        var retnPromise;
        if (!service) {
            retnPromise = Promise.reject(new Error("Unknown service [" + id + "]"));
        }
        else {
            var api = message.api;
            if (typeof service[api] !== 'function') {
                retnPromise = Promise.reject(new Error("Unknown api [" + api + "] in service " + id));
            }
            else {
                try {
                    retnPromise = Promise.resolve(service[api](message.args));
                }
                catch (e) {
                    retnPromise = Promise.reject(e);
                }
            }
        }
        this.sendReturnMessage(retnPromise, message, creator_1.ServServiceMessageCreator.createAPIReturn);
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
    ServServiceServer.prototype.sendEventMessage = function (session, retnPromise, origin, retnCreator) {
        var _this = this;
        retnPromise.then(function (data) {
            var retnMesage = retnCreator(origin, data);
            _this.sendMessage(retnMesage);
        }, function (error) {
            var retnMesage = retnCreator(origin, undefined, error);
            _this.sendMessage(retnMesage);
        });
    };
    return ServServiceServer;
}());
exports.ServServiceServer = ServServiceServer;
//# sourceMappingURL=ServServiceServer.js.map