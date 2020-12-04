"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sappSDK = exports.SappSDK = void 0;
var ServTerminal_1 = require("../terminal/ServTerminal");
var index_1 = require("../common/index");
var ServChannel_1 = require("../session/channel/ServChannel");
var Servkit_1 = require("../servkit/Servkit");
/**
 * SappSDK是为Servkit应用提供的一个SDK
 */
var SappSDK = /** @class */ (function () {
    function SappSDK() {
        this.started = index_1.createDeferred();
        this.setConfig({
        // Default Config
        });
    }
    /**
     * SappSDK的全局配置，需要在start之前设定好
     *
     * @param {SappSDKConfig} config
     * @returns this
     * @memberof SappSDK
     */
    SappSDK.prototype.setConfig = function (config) {
        this.config = config;
        return this;
    };
    /**
     * 获取全局配置
     *
     * @returns
     * @memberof SappSDK
     */
    SappSDK.prototype.getConfig = function () {
        return this.config;
    };
    /**
     * 启动SDK
     *
     * @param {SappStartOptions} [options]
     * @returns {Promise<void>}
     * @memberof SappSDK
     */
    SappSDK.prototype.start = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var config, starting, resolveParams, params, terminalConfig, _a, _b, _c, newTerminalConfig, e_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.isStarted) {
                            return [2 /*return*/];
                        }
                        if (this.starting) {
                            return [2 /*return*/, this.starting];
                        }
                        config = this.config;
                        if (!config) {
                            throw new Error('[SAPPSDK] Config must be set before setup');
                        }
                        starting = index_1.createDeferred();
                        this.starting = starting;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 17, , 18]);
                        options = options || {};
                        if (!config.beforeStart) return [3 /*break*/, 3];
                        return [4 /*yield*/, config.beforeStart(this)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        resolveParams = undefined;
                        if (options.params) {
                            resolveParams =
                                typeof options.params === 'function'
                                    ? options.params
                                    : (function () { return options.params; });
                        }
                        else {
                            resolveParams = config.resolveStartParams || index_1.parseQueryParams;
                        }
                        return [4 /*yield*/, resolveParams(this)];
                    case 4:
                        params = _d.sent();
                        terminalConfig = {
                            id: params.id || '',
                            type: ServTerminal_1.EServTerminal.SLAVE,
                            session: undefined,
                        };
                        if (!config.resolveServiceClientConfig) return [3 /*break*/, 6];
                        _a = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceClientConfig(this)];
                    case 5:
                        _a.client = _d.sent();
                        _d.label = 6;
                    case 6:
                        if (!config.resolveServiceServerConfig) return [3 /*break*/, 8];
                        _b = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceServerConfig(this)];
                    case 7:
                        _b.server = _d.sent();
                        _d.label = 8;
                    case 8:
                        if (!config.resolveSessionConfig) return [3 /*break*/, 10];
                        _c = terminalConfig;
                        return [4 /*yield*/, config.resolveSessionConfig(this)];
                    case 9:
                        _c.session = _d.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        terminalConfig.session = {
                            channel: {
                                type: ServChannel_1.EServChannel.WINDOW,
                            },
                        };
                        _d.label = 11;
                    case 11:
                        if (!config.resolveTerminalConfig) return [3 /*break*/, 13];
                        return [4 /*yield*/, config.resolveTerminalConfig(this, terminalConfig)];
                    case 12:
                        newTerminalConfig = _d.sent();
                        if (newTerminalConfig) {
                            terminalConfig = newTerminalConfig;
                        }
                        _d.label = 13;
                    case 13:
                        // Rewrite type
                        terminalConfig.type = ServTerminal_1.EServTerminal.SLAVE;
                        // Check config validation
                        if (!terminalConfig.id || !terminalConfig.session) {
                            throw new Error('[SAPPSDK] Invalid terminal config');
                        }
                        // Setup terminal
                        this.terminal = (config.servkit || Servkit_1.servkit).createTerminal(terminalConfig);
                        return [4 /*yield*/, this.terminal.openSession()];
                    case 14:
                        _d.sent();
                        // TODO
                        // App validation check
                        // TODO
                        // Setup common service in sdk
                        this.isStarted = true;
                        if (!config.afterStart) return [3 /*break*/, 16];
                        return [4 /*yield*/, config.afterStart(this)];
                    case 15:
                        _d.sent();
                        _d.label = 16;
                    case 16:
                        starting.resolve();
                        this.started.resolve();
                        return [3 /*break*/, 18];
                    case 17:
                        e_1 = _d.sent();
                        if (this.terminal) {
                            this.terminal.servkit.destroyTerminal(this.terminal);
                        }
                        this.terminal = undefined;
                        this.isStarted = false;
                        starting.reject();
                        this.started.reject();
                        return [3 /*break*/, 18];
                    case 18:
                        this.starting = undefined;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 销毁SDK，该方法主要用于CI测试（建议业务不要使用，因为SappSDK生命周期通常与应用程序的生命周期保一致）
     */
    SappSDK.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isStarted) {
                    return [2 /*return*/];
                }
                this.isStarted = false;
                this.starting = undefined;
                this.started = index_1.createDeferred();
                if (this.terminal) {
                    this.terminal.servkit.destroyTerminal(this.terminal);
                    this.terminal = undefined;
                }
                return [2 /*return*/];
            });
        });
    };
    SappSDK.prototype.getService = function () {
        if (!this.isStarted) {
            return;
        }
        return this.terminal.client.getService(arguments[0]);
    };
    SappSDK.prototype.getServiceUnsafe = function () {
        return this.getService.apply(this, arguments);
    };
    SappSDK.prototype.service = function () {
        if (!this.isStarted) {
            return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
        }
        return this.terminal.client.service.apply(this.terminal.client, arguments);
    };
    SappSDK.prototype.serviceExec = function () {
        if (!this.isStarted) {
            return null;
        }
        return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
    };
    return SappSDK;
}());
exports.SappSDK = SappSDK;
exports.sappSDK = new SappSDK();
//# sourceMappingURL=SappSDK.js.map