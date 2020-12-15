"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SappPlainPage = void 0;
var Sapp_1 = require("./Sapp");
var Deferred_1 = require("../common/Deferred");
var ServTerminal_1 = require("../terminal/ServTerminal");
var ServChannel_1 = require("../session/channel/ServChannel");
var common_1 = require("../common");
var SappPlainPage = /** @class */ (function (_super) {
    __extends(SappPlainPage, _super);
    function SappPlainPage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.start = Deferred_1.DeferredUtil.reEntryGuard(_this.mutex.lockGuard(function (options) { return __awaiter(_this, void 0, void 0, function () {
            var config, showParams, _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isStarted) {
                            return [2 /*return*/];
                        }
                        if (this.closed.isFinished()) {
                            throw new Error("[SAPP] App has closed");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 13, , 14]);
                        config = this.config;
                        if (!config) {
                            throw new Error('[SAPP] Config must be set before start');
                        }
                        options = options || {};
                        return [4 /*yield*/, this.beforeStart(options)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.beforeInitTerminal()];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.initTerminal(options)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.afterInitTerminal()];
                    case 5:
                        _b.sent();
                        this.isStarted = true;
                        if (!this.controller) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.controller.doCreate()];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!!this.config.hideOnStart) return [3 /*break*/, 11];
                        showParams = {
                            force: true,
                        };
                        if (!this.config.resolveStartShowData) return [3 /*break*/, 9];
                        _a = showParams;
                        return [4 /*yield*/, this.config.resolveStartShowData(this)];
                    case 8:
                        _a.data = _b.sent();
                        _b.label = 9;
                    case 9: return [4 /*yield*/, this._show(showParams, true)];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11: return [4 /*yield*/, this.afterStart()];
                    case 12:
                        _b.sent();
                        this.started.resolve();
                        return [3 /*break*/, 14];
                    case 13:
                        e_1 = _b.sent();
                        this.started.reject(e_1);
                        this.close();
                        throw e_1;
                    case 14: return [2 /*return*/];
                }
            });
        }); }));
        _this._show = Deferred_1.DeferredUtil.reEntryGuard(_this.showHideMutex.lockGuard(function (params, byCreate) { return __awaiter(_this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.controller) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.controller.doShow()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        common_1.asyncThrow(e_2);
                        return [3 /*break*/, 4];
                    case 4:
                        this.showDone = Deferred_1.DeferredUtil.create();
                        return [2 /*return*/];
                }
            });
        }); }));
        _this._hide = Deferred_1.DeferredUtil.reEntryGuard(_this.showHideMutex.lockGuard(function (params, byClose) { return __awaiter(_this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.showDone) {
                            this.showDone.resolve(params && params.data);
                        }
                        if (!this.controller) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.controller.doHide()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        common_1.asyncThrow(e_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }));
        _this.close = Deferred_1.DeferredUtil.reEntryGuard(_this.mutex.lockGuard(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isStarted) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._hide({ force: true }, true).catch(function () { return undefined; })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.controller) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.controller.doClose(result)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_4 = _a.sent();
                        common_1.asyncThrow(e_4);
                        return [3 /*break*/, 6];
                    case 6:
                        this.isClosed = true;
                        if (result) {
                            if (result.error) {
                                this.closed.reject(result.error);
                            }
                            else {
                                this.closed.resolve(result.data);
                            }
                        }
                        else {
                            this.closed.resolve();
                        }
                        if (this.terminal) {
                            this.terminal.servkit.destroyTerminal(this.terminal);
                            this.terminal = undefined;
                        }
                        this.detachController();
                        this.isStarted = false;
                        this.started = Deferred_1.DeferredUtil.reject(new Error('[SAPP] Closed'));
                        this.started.catch(function () { return undefined; });
                        this.waitOnStart = undefined;
                        this.manager = undefined;
                        return [2 /*return*/];
                }
            });
        }); }));
        return _this;
    }
    SappPlainPage.prototype.show = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._show(params)];
            });
        });
    };
    SappPlainPage.prototype.hide = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._hide(params)];
            });
        });
    };
    SappPlainPage.prototype.initTerminal = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var config, terminalConfig, _a, newTerminalConfig, channelConfig;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        config = this.config;
                        terminalConfig = {
                            id: this.uuid,
                            type: ServTerminal_1.EServTerminal.MASTER,
                            session: {
                                channel: {
                                    type: ServChannel_1.EServChannel.WINDOW,
                                },
                            },
                        };
                        if (!config.resolveSessionConfig) return [3 /*break*/, 2];
                        _a = terminalConfig;
                        return [4 /*yield*/, config.resolveSessionConfig(this)];
                    case 1:
                        _a.session = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        terminalConfig.session = {
                            channel: {
                                type: ServChannel_1.EServChannel.WINDOW,
                            },
                        };
                        _b.label = 3;
                    case 3:
                        if (!config.resolveTerminalConfig) return [3 /*break*/, 5];
                        return [4 /*yield*/, config.resolveTerminalConfig(this, terminalConfig)];
                    case 4:
                        newTerminalConfig = _b.sent();
                        if (newTerminalConfig) {
                            terminalConfig = newTerminalConfig;
                        }
                        _b.label = 5;
                    case 5:
                        terminalConfig.type = ServTerminal_1.EServTerminal.MASTER;
                        terminalConfig.session.checkSession = false;
                        terminalConfig.session.checkOptions = undefined;
                        terminalConfig.client = undefined;
                        terminalConfig.server = undefined;
                        channelConfig = terminalConfig.session.channel.config;
                        if (channelConfig && channelConfig.master) {
                            channelConfig.master.dontWaitEcho = true;
                        }
                        // Check config validation
                        if (!terminalConfig.id || !terminalConfig.session) {
                            throw new Error('[SAPP] Invalid terminal config');
                        }
                        // Setup terminal
                        this.terminal = this.manager.getServkit().createTerminal(terminalConfig);
                        return [4 /*yield*/, this.terminal.openSession()];
                    case 6:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SappPlainPage;
}(Sapp_1.Sapp));
exports.SappPlainPage = SappPlainPage;
//# sourceMappingURL=SappPlainPage.js.map