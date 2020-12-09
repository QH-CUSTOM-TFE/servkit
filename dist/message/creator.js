"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServSessionCallMessageCreator = exports.ServServiceMessageCreator = exports.ServMessageCreator = void 0;
var index_1 = require("../common/index");
var type_1 = require("./type");
var ServMessageCreator = /** @class */ (function () {
    function ServMessageCreator() {
    }
    ServMessageCreator.create = function (type) {
        return {
            $id: index_1.nextUUID(),
            $type: type,
        };
    };
    ServMessageCreator.clone = function (origin) {
        return {
            $id: origin.$id,
            $type: origin.$type,
        };
    };
    return ServMessageCreator;
}());
exports.ServMessageCreator = ServMessageCreator;
var ServServiceMessageCreator = /** @class */ (function () {
    function ServServiceMessageCreator() {
    }
    ServServiceMessageCreator.create = function (type, service) {
        var msg = ServMessageCreator.create(type_1.EServMessage.SERVICE);
        msg.service = service;
        msg.serviceType = type;
        return msg;
    };
    ServServiceMessageCreator.createReturn = function (origin, type, data, error) {
        var msg = ServServiceMessageCreator.clone(origin);
        msg.serviceType = type;
        msg.data = data;
        msg.error = error;
        return msg;
    };
    ServServiceMessageCreator.clone = function (origin) {
        var msg = ServMessageCreator.clone(origin);
        msg.service = origin.service;
        msg.serviceType = origin.serviceType;
        return msg;
    };
    ServServiceMessageCreator.createAPI = function (service, api, args) {
        var msg = ServServiceMessageCreator.create(type_1.EServServiceMessage.API, service);
        msg.api = api;
        msg.args = args;
        return msg;
    };
    ServServiceMessageCreator.createAPIReturn = function (origin, data, error) {
        var msg = ServServiceMessageCreator.clone(origin);
        msg.serviceType = type_1.EServServiceMessage.API_RETURN;
        msg.api = origin.api;
        msg.data = data;
        msg.error = error;
        return msg;
    };
    ServServiceMessageCreator.createEvent = function (service, event, args) {
        var msg = ServServiceMessageCreator.create(type_1.EServServiceMessage.EVENT, service);
        msg.event = event;
        msg.args = args;
        return msg;
    };
    ServServiceMessageCreator.isServiceMessage = function (message) {
        return message.$type === type_1.EServMessage.SERVICE;
    };
    ServServiceMessageCreator.isAPIMessage = function (message) {
        return message.serviceType === type_1.EServServiceMessage.API && ServServiceMessageCreator.isServiceMessage(message);
    };
    ServServiceMessageCreator.isEventMessage = function (message) {
        return message.serviceType === type_1.EServServiceMessage.EVENT && ServServiceMessageCreator.isServiceMessage(message);
    };
    ServServiceMessageCreator.isAPIReturnMessage = function (message, origin) {
        return message.serviceType === type_1.EServServiceMessage.API_RETURN
            && ServServiceMessageCreator.isServiceMessage(message) && (origin ? message.$id === origin.$id : true);
    };
    ServServiceMessageCreator.isGetVersionMessage = function (message) {
        return message.serviceType === type_1.EServServiceMessage.GET_VERSION
            && ServServiceMessageCreator.isServiceMessage(message);
    };
    ServServiceMessageCreator.isGetVersionReturnMessage = function (message, origin) {
        return message.serviceType === type_1.EServServiceMessage.GET_VERSION_RETURN
            && ServServiceMessageCreator.isServiceMessage(message) && (origin ? message.$id === origin.$id : true);
    };
    return ServServiceMessageCreator;
}());
exports.ServServiceMessageCreator = ServServiceMessageCreator;
var ServSessionCallMessageCreator = /** @class */ (function () {
    function ServSessionCallMessageCreator() {
    }
    ServSessionCallMessageCreator.create = function (type, args) {
        var msg = ServMessageCreator.create(type_1.EServMessage.SESSION_CALL);
        msg.type = type;
        msg.args = args;
        return msg;
    };
    ServSessionCallMessageCreator.createReturn = function (origin, data, error) {
        var msg = ServMessageCreator.clone(origin);
        msg.$type = type_1.EServMessage.SESSION_CALL_RETURN;
        msg.data = data;
        msg.error = error;
        return msg;
    };
    ServSessionCallMessageCreator.isCallMessage = function (message) {
        return message.$type === type_1.EServMessage.SESSION_CALL;
    };
    ServSessionCallMessageCreator.isCallReturnMessage = function (message, origin) {
        return message.$type === type_1.EServMessage.SESSION_CALL_RETURN && (origin ? message.$id === origin.$id : true);
    };
    return ServSessionCallMessageCreator;
}());
exports.ServSessionCallMessageCreator = ServSessionCallMessageCreator;
//# sourceMappingURL=creator.js.map