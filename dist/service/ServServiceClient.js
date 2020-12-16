"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServServiceClient = void 0;
var index_1 = require("../common/index");
var creator_1 = require("../message/creator");
var ServMessageContextManager_1 = require("../message/ServMessageContextManager");
var type_1 = require("../message/type");
var ServEventerManager_1 = require("./event/ServEventerManager");
var ServServiceClient = /** @class */ (function () {
    function ServServiceClient(terminal) {
        var _this = this;
        this.onRecvMessage = function (message) {
            // handle return message
            if (!creator_1.ServServiceMessageCreator.isServiceMessage(message)) {
                return false;
            }
            var origin = _this.messageContextManager.get(message.$id);
            if (origin) {
                if (creator_1.ServServiceMessageCreator.isAPIReturnMessage(message, origin)) {
                    return _this.handleAPIReturnMessage(message, origin);
                }
                else if (creator_1.ServServiceMessageCreator.isGetVersionReturnMessage(message, origin)) {
                    return _this.handleCommonMessageReturn(message, origin);
                }
            }
            if (creator_1.ServServiceMessageCreator.isEventMessage(message)) {
                return _this.handleEventMessage(message);
            }
            return false;
        };
        this.terminal = terminal;
    }
    ServServiceClient.prototype.init = function (config) {
        this.services = {};
        this.messageContextManager = new ServMessageContextManager_1.ServMessageContextManager();
        this.messageContextManager.init();
        this.eventerManager = new ServEventerManager_1.ServEventerManager();
        this.eventerManager.init();
        this.sessionUnlisten = this.terminal.session.onRecvMessage(this.onRecvMessage);
    };
    ServServiceClient.prototype.release = function () {
        if (this.sessionUnlisten) {
            this.sessionUnlisten();
            this.sessionUnlisten = undefined;
        }
        this.eventerManager.release();
        this.messageContextManager.release();
        this.services = {};
    };
    ServServiceClient.prototype._getService = function (decl) {
        var metas = decl.meta();
        if (!metas) {
            return;
        }
        var id = metas.id;
        var service = this.services[id];
        if (service) {
            return service;
        }
        service = this.generateService(decl);
        if (service) {
            this.services[id] = service;
        }
        this.checkServiceVersion(metas);
        return service;
    };
    ServServiceClient.prototype.getService = function () {
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
    ServServiceClient.prototype.getServiceUnsafe = function () {
        return this.getService.apply(this, arguments);
    };
    ServServiceClient.prototype.service = function () {
        if (arguments.length === 0) {
            return Promise.reject(new Error('[SERVKIT] Decl is empty'));
        }
        var services = this.serviceExec(arguments[0], function (v) {
            return v;
        });
        return services ? Promise.resolve(services) : Promise.reject(new Error('[SAPPSDK] Get a undefined service'));
    };
    ServServiceClient.prototype.serviceExec = function () {
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
            return exec.call(window, services);
        }
    };
    ServServiceClient.prototype.checkServiceVersion = function (service) {
        this.sendCommonMessageForReturn(creator_1.ServServiceMessageCreator.create(type_1.EServServiceMessage.GET_VERSION, service.id))
            .then(function (curVersion) {
            var version = service.version;
            if (curVersion !== version) {
                index_1.asyncThrowMessage(service.id + " curren version is " + curVersion + ", but " + version + " is used in your projet now, Please update your service npm package.");
            }
        }, function (error) {
            index_1.asyncThrow(error);
        });
    };
    ServServiceClient.prototype.generateService = function (decl) {
        var _this = this;
        var metas = decl.meta();
        if (!metas) {
            return;
        }
        var obj = new decl();
        var id = metas.id;
        metas.apis.forEach(function (item) {
            obj[item.name] = _this.generateServiceAPI(id, item);
        });
        metas.evts.forEach(function (item) {
            obj[item.name] = _this.generateServiceEvent(id, item);
        });
        return obj;
    };
    ServServiceClient.prototype.generateServiceAPI = function (service, meta) {
        var self = this;
        var ret = function (args, options) {
            if (meta.options && meta.options.onCallTransform) {
                args = meta.options.onCallTransform.send(args);
            }
            var timeout = undefined;
            if (options && options.timeout !== undefined) {
                timeout = options.timeout;
            }
            else if (meta.options && meta.options.timeout !== undefined) {
                timeout = meta.options.timeout;
            }
            else {
                timeout = index_1.EServConstant.SERV_API_TIMEOUT;
            }
            var message = creator_1.ServServiceMessageCreator.createAPI(service, meta.name, args);
            if (meta.options && meta.options.dontRetn) {
                return self.sendMessage(message);
            }
            var addOptions = {
                timeout: timeout,
                prewait: self.sendMessage(message),
                ctxData: meta,
            };
            var promise = self.messageContextManager.add(message, addOptions);
            if (!promise) {
                promise = self.messageContextManager.getPromise(message.$id);
            }
            if (!promise) {
                promise = Promise.reject(new Error('unknown'));
            }
            return promise;
        };
        return ret;
    };
    ServServiceClient.prototype.generateServiceEvent = function (service, meta) {
        return this.eventerManager.spawn(service, meta.name);
    };
    ServServiceClient.prototype.sendMessage = function (message) {
        return this.terminal.session.sendMessage(message);
    };
    ServServiceClient.prototype.handleAPIReturnMessage = function (message, origin) {
        if (message.error) {
            return this.messageContextManager.failed(message.$id, message.error);
        }
        else {
            var data = message.data;
            var meta = this.messageContextManager.getCtxData(message.$id);
            if (meta && meta.options && meta.options.onRetnTransform) {
                data = meta.options.onRetnTransform.recv(data);
            }
            return this.messageContextManager.succeed(message.$id, data);
        }
    };
    ServServiceClient.prototype.sendCommonMessageForReturn = function (message, timeout) {
        if (timeout === void 0) { timeout = index_1.EServConstant.SERV_COMMON_RETURN_TIMEOUT; }
        var addOptions = {
            timeout: timeout,
            prewait: this.sendMessage(message),
        };
        var promise = this.messageContextManager.add(message, addOptions);
        if (!promise) {
            promise = this.messageContextManager.getPromise(message.$id);
        }
        if (!promise) {
            promise = Promise.reject(new Error('unknown'));
        }
        return promise;
    };
    ServServiceClient.prototype.handleCommonMessageReturn = function (message, origin) {
        if (message.error) {
            return this.messageContextManager.failed(message.$id, message.error);
        }
        else {
            return this.messageContextManager.succeed(message.$id, message.data);
        }
    };
    ServServiceClient.prototype.handleEventMessage = function (message) {
        this.eventerManager.rawEmit(message.service, message.event, message.args);
        return true;
    };
    return ServServiceClient;
}());
exports.ServServiceClient = ServServiceClient;
//# sourceMappingURL=ServServiceClient.js.map