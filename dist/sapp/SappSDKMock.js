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
exports.SappSDKMock = void 0;
var ServTerminal_1 = require("../terminal/ServTerminal");
var common_1 = require("../common/common");
var ServChannel_1 = require("../session/channel/ServChannel");
var SappLifecycle_1 = require("./service/m/SappLifecycle");
var ServService_1 = require("../service/ServService");
var AsyncMutex_1 = require("../common/AsyncMutex");
var Deferred_1 = require("../common/Deferred");
var SappLifecycle_2 = require("./service/s/SappLifecycle");
var SappSDK_1 = require("./SappSDK");
var Sapp_1 = require("./Sapp");
var sharedParams_1 = require("../common/sharedParams");
var SappSDKMock = /** @class */ (function () {
    function SappSDKMock(sdk) {
        var _this = this;
        this.mutex = new AsyncMutex_1.AsyncMutex();
        this.showHideMutex = new AsyncMutex_1.AsyncMutex();
        this._show = Deferred_1.DeferredUtil.reEntryGuard(this.showHideMutex.lockGuard(function (params, byCreate) { return __awaiter(_this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.terminal.client.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onShow(__assign(__assign({}, params), { byCreate: byCreate })).then(function (dontShow) {
                                if (dontShow) {
                                    common_1.asyncThrow(new Error("[SAPPSDK] Can't show app because rejection"));
                                }
                                return {
                                    dontShow: !!dontShow,
                                };
                            }, function (error) {
                                common_1.asyncThrow(error);
                                common_1.asyncThrow(new Error("[SAPPSDK] Can't show app because error"));
                                return {
                                    error: error,
                                };
                            });
                        }, function (error) {
                            common_1.asyncThrow(error);
                            common_1.asyncThrow(new Error("[SAPPSDK] Can't show app because lifecycle service not provided"));
                            return {
                                error: error,
                            };
                        })];
                    case 1:
                        ret = _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); }));
        this._hide = Deferred_1.DeferredUtil.reEntryGuard(this.showHideMutex.lockGuard(function (params, byClose) { return __awaiter(_this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.terminal.client.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onHide(__assign({ byClose: byClose }, params)).then(function (dontHide) {
                                if (dontHide) {
                                    common_1.asyncThrow(new Error("[SAPPSDK] Can't hide app because rejection"));
                                }
                                return {
                                    dontHide: !!dontHide,
                                };
                            }, function (error) {
                                common_1.asyncThrow(error);
                                common_1.asyncThrow(new Error("[SAPPSDK] Can't hide app because error"));
                                return {
                                    error: error,
                                };
                            });
                        }, function (error) {
                            common_1.asyncThrow(error);
                            common_1.asyncThrow(new Error("[SAPPSDK] Can't hide app because lifecycle service not provided"));
                            return {
                                error: error,
                            };
                        })];
                    case 1:
                        ret = _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); }));
        this.close = Deferred_1.DeferredUtil.reEntryGuard(this.mutex.lockGuard(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var onCloseResult, terminal_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isStarted) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.terminal.client.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                                return service.onClose();
                            }).catch(function (error) {
                                common_1.asyncThrow(error);
                            })];
                    case 1:
                        onCloseResult = _a.sent();
                        if (onCloseResult && onCloseResult.dontClose) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 2;
                    case 2:
                        if (this.terminal) {
                            terminal_1 = this.terminal;
                            this.terminal = undefined;
                            // The close operation maybe from sapp, need to send back message;
                            // so lazy the destroy to next tick 
                            setTimeout(function () {
                                terminal_1.servkit.destroyTerminal(terminal_1);
                            });
                        }
                        this.sdk = undefined;
                        this.isStarted = false;
                        this.waitOnStart = undefined;
                        return [2 /*return*/, true];
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
                return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
            }
            return this.terminal.client.service.apply(this.terminal.client, arguments);
        };
        this.serviceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
        };
        this.getServerService = function () {
            if (!this.isStarted) {
                return;
            }
            return this.terminal.server.getService(arguments[0]);
        };
        this.getServerServiceUnsafe = function () {
            return this.getServerService.apply(this, arguments);
        };
        this.serverService = function () {
            if (!this.isStarted) {
                return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
            }
            return this.terminal.server.service.apply(this.terminal.server, arguments);
        };
        this.serverServiceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
        };
        this.sdk = sdk;
        this.setConfig({});
    }
    SappSDKMock.isMockEnabled = function () {
        try {
            return common_1.Env.SAPPSDK_MOCK
                || (!!window.location.search && window.location.search.indexOf(SappSDKMock.ENABLE_MARK) >= 0);
        }
        catch (e) {
            return false;
        }
    };
    SappSDKMock.tryAsynLoadBootstrap = function (appId) {
        try {
            if (!SappSDKMock.isMockEnabled()) {
                return;
            }
            setTimeout(function () {
                var context = sharedParams_1.getAsyncLoadDeclContext(appId);
                if (context) {
                    context.bootstrap();
                }
            }, Math.random() * 50);
        }
        catch (e) {
            //
        }
    };
    SappSDKMock.prototype.setConfig = function (config) {
        this.config = config;
        return this;
    };
    SappSDKMock.prototype.getConfig = function () {
        return this.config;
    };
    SappSDKMock.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!SappSDKMock.isMockEnabled()) {
                            return [2 /*return*/];
                        }
                        if (!this.config) {
                            throw new Error('[SAPPSDK] Mock config is invalid');
                        }
                        if (!this.sdk) {
                            throw new Error('[SAPPSDK] Mock has closed');
                        }
                        return [4 /*yield*/, this.beforeStart()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.initTerminal()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.prepareForAsyncLoad()];
                    case 3:
                        _a.sent();
                        this.waitOnStart = Deferred_1.DeferredUtil.create();
                        this.waitOnStart.then(function () {
                            _this.waitOnStart = undefined;
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var showParams, data;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.isStarted = true;
                                            if (!!this.config.hideOnStart) return [3 /*break*/, 3];
                                            showParams = {
                                                force: true,
                                            };
                                            return [4 /*yield*/, this.resolveStartShowData()];
                                        case 1:
                                            data = _a.sent();
                                            if (data !== undefined) {
                                                showParams.data = data;
                                            }
                                            return [4 /*yield*/, this._show(showParams, true)];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [4 /*yield*/, this.afterStart()];
                                        case 4:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, Math.random() * 50);
                        }, function () {
                            _this.waitOnStart = undefined;
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SappSDKMock.prototype.initTerminal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isAsyncLoadApp, terminalConfig, config, _a, services, service, _b, terminal, self, SappLifecycleImpl;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        isAsyncLoadApp = this.sdk.getAppType() === Sapp_1.ESappType.ASYNC_LOAD;
                        terminalConfig = {
                            id: common_1.nextUUID(),
                            type: ServTerminal_1.EServTerminal.MASTER,
                            session: {
                                checkSession: true,
                                checkOptions: {
                                    onBroken: function () {
                                        _this.onSessionBroken();
                                    },
                                },
                                channel: {
                                    type: isAsyncLoadApp ? ServChannel_1.EServChannel.EVENT : ServChannel_1.EServChannel.MESSAGE,
                                },
                            },
                        };
                        config = this.config;
                        if (!config.resolveServiceServerConfig) return [3 /*break*/, 2];
                        _a = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceServerConfig()];
                    case 1:
                        _a.server = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!terminalConfig.server) {
                            terminalConfig.server = {};
                        }
                        services = config.services;
                        if (services && terminalConfig.server.service && terminalConfig.server.service.services) {
                            services = services.concat(terminalConfig.server.service.services);
                        }
                        if (services) {
                            service = terminalConfig.server.service || {};
                            service.services = services;
                            terminalConfig.server.service = service;
                        }
                        if (config.serviceRefer) {
                            terminalConfig.server.serviceRefer = config.serviceRefer;
                        }
                        if (!terminalConfig.server.serviceRefer) {
                            terminalConfig.server.serviceRefer = /.*/;
                        }
                        if (!config.resolveServiceClientConfig) return [3 /*break*/, 4];
                        _b = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceClientConfig()];
                    case 3:
                        _b.client = _c.sent();
                        _c.label = 4;
                    case 4:
                        terminal = this.sdk.getServkit().createTerminal(terminalConfig);
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
                                return ServService_1.API_SUCCEED();
                            };
                            class_1.prototype.getStartData = function () {
                                return self.resolveStartData();
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
                        terminal.server.addServices([{
                                decl: SappLifecycle_1.SappLifecycle,
                                impl: SappLifecycleImpl,
                            }], {
                            lazy: true,
                        });
                        return [4 /*yield*/, terminal.openSession()];
                    case 5:
                        _c.sent();
                        this.terminal = terminal;
                        return [2 /*return*/];
                }
            });
        });
    };
    SappSDKMock.prototype.fixSlaveTerminalConfig = function (config) {
        var isAsyncLoadApp = this.sdk.getAppType() === Sapp_1.ESappType.ASYNC_LOAD;
        config.id = this.terminal.id;
        config.session.checkSession = true;
        config.session.channel = {
            type: isAsyncLoadApp ? ServChannel_1.EServChannel.EVENT : ServChannel_1.EServChannel.MESSAGE,
        };
    };
    SappSDKMock.prototype.resolveStartData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resolveData;
            return __generator(this, function (_a) {
                resolveData = this.config.resolveStartData;
                if (resolveData) {
                    return [2 /*return*/, resolveData()];
                }
                return [2 /*return*/];
            });
        });
    };
    SappSDKMock.prototype.resolveStartShowData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resolveData;
            return __generator(this, function (_a) {
                resolveData = this.config.resolveStartShowData;
                if (resolveData) {
                    return [2 /*return*/, resolveData()];
                }
                return [2 /*return*/];
            });
        });
    };
    SappSDKMock.prototype.show = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._show(params)];
            });
        });
    };
    SappSDKMock.prototype.hide = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._hide(params)];
            });
        });
    };
    SappSDKMock.prototype.beforeStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.beforeStart) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.beforeStart()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SappSDKMock.prototype.afterStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.afterStart) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.afterStart()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SappSDKMock.prototype.onSessionBroken = function () {
        if (this.sdk) {
            common_1.asyncThrow(new Error('Session broken'));
            this.close();
        }
    };
    SappSDKMock.prototype.prepareForAsyncLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sdk, config, layout, el;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sdk = this.sdk;
                        if (!(sdk instanceof SappSDK_1.SappAsyncLoadSDK)) {
                            return [2 /*return*/];
                        }
                        config = this.config;
                        if (!config.resolveAsyncLoadLayout) return [3 /*break*/, 2];
                        return [4 /*yield*/, config.resolveAsyncLoadLayout()];
                    case 1:
                        layout = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!layout || !layout.container) {
                            el = document.createElement('div');
                            el.style.position = 'absolute';
                            el.style.top = '0';
                            el.style.left = '0';
                            el.style.width = '100%';
                            el.style.height = '100%';
                            document.body.appendChild(el);
                            layout = {
                                container: el,
                            };
                        }
                        sharedParams_1.putAsyncLoadStartParams(sdk.getAppId(), {
                            uuid: this.terminal.id,
                            container: layout.container,
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SappSDKMock.ENABLE_MARK = '__SAPPSDK_MOCK_ENABLE__';
    return SappSDKMock;
}());
exports.SappSDKMock = SappSDKMock;
//# sourceMappingURL=SappSDKMock.js.map