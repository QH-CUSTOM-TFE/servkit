"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.servkit = exports.Servkit = void 0;
var index_1 = require("../common/index");
var session_1 = require("../session");
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
        this.initGlobalTerminals(config);
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
    Servkit.prototype.initGlobalTerminals = function (config) {
        var id = 'com.servkit.global.' + parseInt((Math.random() * 10000) + '', 10) + Date.now();
        var serverTerminal = this.createTerminal({
            id: id,
            type: ServTerminal_1.EServTerminal.MASTER,
            session: {
                channel: {
                    type: session_1.EServChannel.EVENT,
                },
            },
            server: __assign(__assign({}, config.server), { serviceRefer: /.*/ }),
        });
        var clientTerminal = this.createTerminal({
            id: id,
            type: ServTerminal_1.EServTerminal.SLAVE,
            session: {
                channel: {
                    type: session_1.EServChannel.EVENT,
                },
            },
            client: config.client,
        });
        serverTerminal.openSession();
        clientTerminal.openSession();
        this.server = serverTerminal.server;
        this.client = clientTerminal.client;
    };
    return Servkit;
}());
exports.Servkit = Servkit;
exports.servkit = new Servkit();
try {
    exports.servkit.init();
}
catch (e) {
    index_1.asyncThrow(e);
}
//# sourceMappingURL=Servkit.js.map