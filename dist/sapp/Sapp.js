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
exports.Sapp = void 0;
var ServTerminal_1 = require("../terminal/ServTerminal");
var index_1 = require("../common/index");
var ServChannel_1 = require("../session/channel/ServChannel");
var ServService_1 = require("../service/ServService");
var SappLifecycle_1 = require("./service/m/SappLifecycle");
var SappLifecycle_2 = require("./service/s/SappLifecycle");
var Deferred_1 = require("../common/Deferred");
var AsyncMutex_1 = require("../common/AsyncMutex");
var Sapp = /** @class */ (function () {
    function Sapp(uuid, info, manager) {
        var _this = this;
        this.mutex = new AsyncMutex_1.AsyncMutex();
        this.showHideMutex = new AsyncMutex_1.AsyncMutex();
        this.start = Deferred_1.DeferredUtil.reEntryGuard(this.mutex.lockGuard(function (options) { return __awaiter(_this, void 0, void 0, function () {
            var config, waitOnAuth, waitOnStart, showParams, _a, e_1;
            var _this = this;
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
                        _b.trys.push([1, 15, , 16]);
                        config = this.config;
                        if (!config) {
                            throw new Error('[SAPP] Config must be set before start');
                        }
                        waitOnAuth = Deferred_1.DeferredUtil.create({ timeout: index_1.EServConstant.SERV_SAPP_ON_START_TIMEOUT });
                        this.waitOnAuth = waitOnAuth;
                        waitOnStart = Deferred_1.DeferredUtil.create({
                            timeout: index_1.EServConstant.SERV_SAPP_ON_START_TIMEOUT,
                            rejectIf: waitOnAuth,
                        });
                        this.waitOnStart = waitOnStart;
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
                        return [4 /*yield*/, waitOnAuth.catch(function (error) {
                                if (_this.waitOnAuth) {
                                    index_1.asyncThrow(new Error('[SAPP] App auth failed'));
                                }
                                throw error;
                            })];
                    case 6:
                        _b.sent();
                        this.waitOnAuth = undefined;
                        return [4 /*yield*/, waitOnStart.catch(function (error) {
                                if (_this.waitOnStart) {
                                    index_1.asyncThrow(new Error('[SAPP] App start timeout'));
                                }
                                throw error;
                            })];
                    case 7:
                        _b.sent();
                        this.waitOnStart = undefined;
                        this.isStarted = true;
                        if (!this.controller) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.controller.doCreate()];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        if (!!this.config.hideOnStart) return [3 /*break*/, 13];
                        showParams = {
                            force: true,
                        };
                        if (!this.config.resolveStartShowData) return [3 /*break*/, 11];
                        _a = showParams;
                        return [4 /*yield*/, this.config.resolveStartShowData(this)];
                    case 10:
                        _a.data = _b.sent();
                        _b.label = 11;
                    case 11: return [4 /*yield*/, this._show(showParams, true)];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [4 /*yield*/, this.afterStart()];
                    case 14:
                        _b.sent();
                        this.started.resolve();
                        return [3 /*break*/, 16];
                    case 15:
                        e_1 = _b.sent();
                        this.started.reject(e_1);
                        this.close();
                        throw e_1;
                    case 16: return [2 /*return*/];
                }
            });
        }); }));
        this._show = Deferred_1.DeferredUtil.reEntryGuard(this.showHideMutex.lockGuard(function (params, byCreate) { return __awaiter(_this, void 0, void 0, function () {
            var ret, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onShow(__assign(__assign({}, params), { byCreate: byCreate })).then(function (dontShow) {
                                if (dontShow) {
                                    index_1.asyncThrow(new Error("[SAPP] Can't show app because rejection"));
                                }
                                return {
                                    dontShow: !!dontShow,
                                };
                            }, function (error) {
                                index_1.asyncThrow(error);
                                index_1.asyncThrow(new Error("[SAPP] Can't show app because error"));
                                return {
                                    error: error,
                                };
                            });
                        }, function (error) {
                            index_1.asyncThrow(error);
                            index_1.asyncThrow(new Error("[SAPP] Can't show app because lifecycle service not provided"));
                            return {
                                error: error,
                            };
                        })];
                    case 1:
                        ret = _a.sent();
                        if (!(!ret.error && ((params && params.force) || !ret.dontShow))) return [3 /*break*/, 6];
                        if (!this.controller) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.controller.doShow()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        index_1.asyncThrow(e_2);
                        return [3 /*break*/, 5];
                    case 5:
                        this.showDone = Deferred_1.DeferredUtil.create();
                        return [3 /*break*/, 7];
                    case 6:
                        if (ret.error) {
                            throw ret.error;
                        }
                        if (ret.dontShow) {
                            throw new Error('reject');
                        }
                        throw new Error('unknow');
                    case 7: return [2 /*return*/];
                }
            });
        }); }));
        this._hide = Deferred_1.DeferredUtil.reEntryGuard(this.showHideMutex.lockGuard(function (params, byClose) { return __awaiter(_this, void 0, void 0, function () {
            var ret, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onHide(__assign({ byClose: byClose }, params)).then(function (dontHide) {
                                if (dontHide) {
                                    index_1.asyncThrow(new Error("[SAPP] Can't hide app because rejection"));
                                }
                                return {
                                    dontHide: !!dontHide,
                                };
                            }, function (error) {
                                index_1.asyncThrow(error);
                                index_1.asyncThrow(new Error("[SAPP] Can't hide app because error"));
                                return {
                                    error: error,
                                };
                            });
                        }, function (error) {
                            index_1.asyncThrow(error);
                            index_1.asyncThrow(new Error("[SAPP] Can't hide app because lifecycle service not provided"));
                            return {
                                error: error,
                            };
                        })];
                    case 1:
                        ret = _a.sent();
                        if (!(!ret.error && ((params && params.force) || !ret.dontHide))) return [3 /*break*/, 6];
                        if (this.showDone) {
                            this.showDone.resolve(params && params.data);
                        }
                        if (!this.controller) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.controller.doHide()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        index_1.asyncThrow(e_3);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        if (ret.error) {
                            throw ret.error;
                        }
                        if (ret.dontHide) {
                            throw new Error('reject');
                        }
                        throw new Error('unknow');
                    case 7: return [2 /*return*/];
                }
            });
        }); }));
        this.close = Deferred_1.DeferredUtil.reEntryGuard(this.mutex.lockGuard(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isStarted) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._hide({ force: true }, true).catch(function () { return undefined; })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                                return service.onClose();
                            }).catch(function (error) {
                                index_1.asyncThrow(error);
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!this.controller) return [3 /*break*/, 7];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.controller.doClose(result)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_4 = _a.sent();
                        index_1.asyncThrow(e_4);
                        return [3 /*break*/, 7];
                    case 7:
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
                        this.waitOnAuth = undefined;
                        this.manager = undefined;
                        return [2 /*return*/];
                }
            });
        }); }));
        this.getService = function () {
            if (!this.isStarted) {
                return;
            }
            return this.terminal.client.getService(arguments[0]);
        };
        this.getServiceUnsafe = function () {
            return this.getService.apply(this, arguments);
        };
        this.service = function () {
            if (!this.isStarted) {
                return Promise.reject(new Error('[SAPP] Sapp is not started'));
            }
            return this.terminal.client.service.apply(this.terminal.client, arguments);
        };
        this.serviceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
        };
        this.uuid = uuid;
        this.info = info;
        this.manager = manager;
        this.started = Deferred_1.DeferredUtil.create();
        this.closed = Deferred_1.DeferredUtil.create();
        this.mutex = new AsyncMutex_1.AsyncMutex();
        this.showHideMutex = new AsyncMutex_1.AsyncMutex();
        this.setConfig({});
    }
    Sapp.prototype.attachController = function (controller) {
        if (this.controller === controller) {
            return false;
        }
        if (this.controller && this.controller !== controller) {
            this.detachController();
        }
        this.controller = controller;
        if (controller) {
            controller.onAttach(this);
        }
        return true;
    };
    Sapp.prototype.detachController = function () {
        if (this.controller) {
            this.controller.onDetach(this);
            this.controller = undefined;
        }
    };
    Sapp.prototype.getController = function () {
        return this.controller;
    };
    Sapp.prototype.setConfig = function (config) {
        this.config = config;
        return this;
    };
    Sapp.prototype.getConfig = function () {
        return this.config;
    };
    Sapp.prototype.show = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._show(params)];
            });
        });
    };
    Sapp.prototype.hide = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._hide(params)];
            });
        });
    };
    Sapp.prototype.auth = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.controller) {
                    return [2 /*return*/];
                }
                return [2 /*return*/, this.controller.doAuth(params)];
            });
        });
    };
    Sapp.prototype.beforeStart = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.beforeStart) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.beforeStart(this)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Sapp.prototype.afterStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.afterStart) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.afterStart(this)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Sapp.prototype.onStartFailed = function () {
        if (this.terminal) {
            this.terminal.servkit.destroyTerminal(this.terminal);
        }
        this.terminal = undefined;
    };
    Sapp.prototype.resolveStartData = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var resolveData;
            return __generator(this, function (_a) {
                resolveData = undefined;
                if (options.data) {
                    resolveData =
                        typeof options.data === 'function'
                            ? options.data
                            : (function () { return options.data; });
                }
                else {
                    resolveData = this.config.resolveStartData;
                }
                if (resolveData) {
                    return [2 /*return*/, resolveData(this)];
                }
                return [2 /*return*/];
            });
        });
    };
    Sapp.prototype.beforeInitTerminal = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Sapp.prototype.initTerminal = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var config, terminalConfig, _a, _b, _c, newTerminalConfig, self, SappLifecycleImpl;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        config = this.config;
                        terminalConfig = {
                            id: this.uuid,
                            type: ServTerminal_1.EServTerminal.MASTER,
                            session: undefined,
                        };
                        if (!config.resolveServiceClientConfig) return [3 /*break*/, 2];
                        _a = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceClientConfig(this)];
                    case 1:
                        _a.client = _d.sent();
                        _d.label = 2;
                    case 2:
                        if (!config.resolveServiceServerConfig) return [3 /*break*/, 4];
                        _b = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceServerConfig(this)];
                    case 3:
                        _b.server = _d.sent();
                        _d.label = 4;
                    case 4:
                        if (!config.resolveSessionConfig) return [3 /*break*/, 6];
                        _c = terminalConfig;
                        return [4 /*yield*/, config.resolveSessionConfig(this)];
                    case 5:
                        _c.session = _d.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        terminalConfig.session = {
                            channel: {
                                type: ServChannel_1.EServChannel.WINDOW,
                            },
                        };
                        _d.label = 7;
                    case 7:
                        if (!config.resolveTerminalConfig) return [3 /*break*/, 9];
                        return [4 /*yield*/, config.resolveTerminalConfig(this, terminalConfig)];
                    case 8:
                        newTerminalConfig = _d.sent();
                        if (newTerminalConfig) {
                            terminalConfig = newTerminalConfig;
                        }
                        _d.label = 9;
                    case 9:
                        // Rewrite type
                        terminalConfig.type = ServTerminal_1.EServTerminal.MASTER;
                        // Check config validation
                        if (!terminalConfig.id || !terminalConfig.session) {
                            throw new Error('[SAPP] Invalid terminal config');
                        }
                        // Setup terminal
                        this.terminal = this.manager.getServkit().createTerminal(terminalConfig);
                        self = this;
                        SappLifecycleImpl = /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            class_1.prototype.onStart = function () {
                                if (self.waitOnStart) {
                                    self.waitOnStart.resolve();
                                }
                                return ServService_1.API_SUCCEED();
                            };
                            class_1.prototype.auth = function (params) {
                                var p = self.auth(params);
                                p.then(function () {
                                    if (self.waitOnAuth) {
                                        self.waitOnAuth.resolve();
                                    }
                                }, function (e) {
                                    if (self.waitOnAuth) {
                                        self.waitOnAuth.reject(e);
                                    }
                                });
                                return p;
                            };
                            class_1.prototype.getStartData = function () {
                                return self.resolveStartData(options);
                            };
                            class_1.prototype.show = function (p) {
                                return self.show(p);
                            };
                            class_1.prototype.hide = function (p) {
                                return self.hide(p);
                            };
                            class_1.prototype.close = function (result) {
                                return self.close(result);
                            };
                            return class_1;
                        }(SappLifecycle_1.SappLifecycle));
                        ServService_1.anno.impl()(SappLifecycleImpl);
                        this.terminal.server.addServices([{
                                decl: SappLifecycle_1.SappLifecycle,
                                impl: SappLifecycleImpl,
                            }], {
                            lazy: true,
                        });
                        return [4 /*yield*/, this.terminal.openSession()];
                    case 10:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Sapp.prototype.afterInitTerminal = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Sapp;
}());
exports.Sapp = Sapp;
//# sourceMappingURL=Sapp.js.map