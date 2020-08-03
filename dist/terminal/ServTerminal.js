"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServTerminal = exports.EServTerminal = void 0;
var ServServiceClient_1 = require("../service/ServServiceClient");
var ServServiceServer_1 = require("../service/ServServiceServer");
var ServSession_1 = require("../session/ServSession");
var EServTerminal;
(function (EServTerminal) {
    EServTerminal[EServTerminal["NULL"] = 0] = "NULL";
    EServTerminal[EServTerminal["MASTER"] = 1] = "MASTER";
    EServTerminal[EServTerminal["SLAVE"] = 2] = "SLAVE";
})(EServTerminal = exports.EServTerminal || (exports.EServTerminal = {}));
var ServTerminal = /** @class */ (function () {
    function ServTerminal(servkit) {
        this.servkit = servkit;
    }
    ServTerminal.prototype.init = function (config) {
        this.id = config.id;
        this.type = config.type;
        this.session = new ServSession_1.ServSession(this);
        this.server = new ServServiceServer_1.ServServiceServer(this);
        this.client = new ServServiceClient_1.ServServiceClient(this);
        this.session.init(config.session);
        this.server.init(config.server);
        this.client.init(config.client);
    };
    ServTerminal.prototype.isMaster = function () {
        return this.type === EServTerminal.MASTER;
    };
    ServTerminal.prototype.release = function () {
        this.client.release();
        this.server.release();
        this.session.release();
    };
    ServTerminal.prototype.openSession = function (options) {
        return this.session.open(options);
    };
    ServTerminal.prototype.closeSession = function () {
        return this.session.close();
    };
    return ServTerminal;
}());
exports.ServTerminal = ServTerminal;
//# sourceMappingURL=ServTerminal.js.map