"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServServiceClient = void 0;
var index_1 = require("../common/index");
var creator_1 = require("../message/creator");
var ServMessageContextManager_1 = require("../message/ServMessageContextManager");
var ServEventerManager_1 = require("./event/ServEventerManager");
var ServService_1 = require("./ServService");
var ServServiceClient = /** @class */ (function () {
    function ServServiceClient(terminal) {
        var _this = this;
        this.onRecvMessage = function (message) {
            // handle return message
            if (!creator_1.ServServiceMessageCreator.isServiceMessage(message)) {
                return false;
            }
            var origin = _this.messageContextManager.get(message.$id);
            if (origin
                && creator_1.ServServiceMessageCreator.isAPIReturnMessage(message, origin)) {
                return _this.handleAPIReturnMessage(message, origin);
            }
            if (creator_1.ServServiceMessageCreator.isEventMessage(message)) {
                return _this.handleEventMessage(message);
            }
            return false;
        };
        this.terminal = terminal;
    }
    ServServiceClient.prototype.init = function (confit) {
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
    ServServiceClient.prototype.getService = function (decl) {
        var metas = ServService_1.util.meta(decl);
        if (!metas) {
            return;
        }
        var id = metas.id;
        var service = this.services[id];
        if (service) {
            return service;
        }
        // TODO
        // Do version check work
        service = this.generateService(decl);
        if (service) {
            this.services[name] = service;
        }
        return service;
    };
    ServServiceClient.prototype.serviceExec = function (decl, exec) {
        var service = this.getService(decl);
        if (!service) {
            return null;
        }
        return exec(service);
    };
    ServServiceClient.prototype.generateService = function (decl) {
        var _this = this;
        var metas = ServService_1.util.meta(decl);
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
            var message = creator_1.ServServiceMessageCreator.createAPI(service, meta.name, args);
            var addOptions = {
                timeout: (options && options.timeout) || index_1.EServConstant.SERV_API_TIMEOUT,
                prewait: self.sendMessage(message),
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