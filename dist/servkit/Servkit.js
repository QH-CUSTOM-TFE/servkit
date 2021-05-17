"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servkit = exports.Servkit = void 0;
var common_1 = require("../common/common");
var ServTerminal_1 = require("../terminal/ServTerminal");
var ServGlobalServiceManager_1 = require("./ServGlobalServiceManager");
var Servkit = /** @class */ (function () {
    function Servkit(namespace) {
        this.namespace = namespace || '';
    }
    Servkit.prototype.init = function (config) {
        config = config || {};
        this.terminals = [];
        this.service = new ServGlobalServiceManager_1.ServGlobalServiceManager();
        this.service.init(config && config.service);
    };
    Servkit.prototype.release = function () {
        var terminals = this.terminals;
        this.terminals = [];
        terminals.forEach(function (item) {
            item.release();
        });
        this.service.release();
    };
    Servkit.prototype.createTerminal = function (config) {
        if (this.terminals.some(function (item) {
            return item.id === config.id && item.type === config.type;
        })) {
            throw new Error("[SERVKIT] Terminal [" + config.id + ":" + config.type + "] conflicts.");
        }
        var terminal = new ServTerminal_1.ServTerminal(this);
        terminal.init(config);
        return terminal;
    };
    Servkit.prototype.destroyTerminal = function (terminal) {
        terminal.release();
    };
    Servkit.prototype.onTerminalInit = function (terminal) {
        this.terminals.push(terminal);
    };
    Servkit.prototype.onTerminalRelease = function (terminal) {
        var i = this.terminals.indexOf(terminal);
        if (i >= 0) {
            this.terminals.splice(i, 1);
        }
    };
    return Servkit;
}());
exports.Servkit = Servkit;
var sInstance = undefined;
try {
    sInstance = new Servkit();
    sInstance.init();
}
catch (e) {
    common_1.asyncThrow(e);
}
exports.servkit = sInstance;
//# sourceMappingURL=Servkit.js.map