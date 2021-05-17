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
exports.sappSDK = exports.SappAsyncLoadSDK = exports.SappSDK = exports.ESappSDKLifeCycleEvent = void 0;
var ServTerminal_1 = require("../terminal/ServTerminal");
var common_1 = require("../common/common");
var query_1 = require("../common/query");
var ServChannel_1 = require("../session/channel/ServChannel");
var Servkit_1 = require("../servkit/Servkit");
var ServService_1 = require("../service/ServService");
var SappLifecycle_1 = require("./service/s/SappLifecycle");
var SappLifecycle_2 = require("./service/m/SappLifecycle");
var Deferred_1 = require("../common/Deferred");
var SappSDKMock_1 = require("./SappSDKMock");
var sharedParams_1 = require("../common/sharedParams");
var Sapp_1 = require("./Sapp");
var eventemitter3_1 = require("eventemitter3");
/**
 * SappSDK生命周期事件
 *
 * @export
 * @enum {number}
 */
var ESappSDKLifeCycleEvent;
(function (ESappSDKLifeCycleEvent) {
    ESappSDKLifeCycleEvent["BEFORE_START"] = "BEFORE_START";
    ESappSDKLifeCycleEvent["ON_CREATE"] = "ON_CREATE";
    ESappSDKLifeCycleEvent["ON_SHOW"] = "ON_SHOW";
    ESappSDKLifeCycleEvent["ON_HIDE"] = "ON_HIDE";
    ESappSDKLifeCycleEvent["ON_CLOSE"] = "ON_CLOSE";
    ESappSDKLifeCycleEvent["AFTER_START"] = "AFTER_START";
})(ESappSDKLifeCycleEvent = exports.ESappSDKLifeCycleEvent || (exports.ESappSDKLifeCycleEvent = {}));
/**
 * SappSDK是从应用与主应用交互的桥梁，也是从应用自身的抽象；
 * 主要提供了：
 * 1：自身生命周期管理
 * 2：与主应用的交互接口，获取服务API
 *
 * @export
 * @class SappSDK
 * @extends {EventEmitter}
 */
var SappSDK = /** @class */ (function (_super) {
    __extends(SappSDK, _super);
    function SappSDK() {
        var _this = _super.call(this) || this;
        /**
         * 启动SDK；具有防重入处理；会触发onCreate回调
         *
         * @param {SappSDKStartOptions} [options]
         * @returns {Promise<void>}
         * @memberof SappSDK
         */
        _this.start = Deferred_1.DeferredUtil.reEntryGuard(function (options) { return __awaiter(_this, void 0, void 0, function () {
            var config, params, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isStarted) {
                            return [2 /*return*/];
                        }
                        config = this.config;
                        if (!config) {
                            throw new Error('[SAPPSDK] Config must be set before setup');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 13, , 14]);
                        options = options || {};
                        if (!this.sdkMock) return [3 /*break*/, 3];
                        if (config.mock) {
                            this.sdkMock.setConfig(config.mock);
                        }
                        return [4 /*yield*/, this.sdkMock.start()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.beforeStart(options)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.resolveStartParams(options)];
                    case 5:
                        params = _a.sent();
                        return [4 /*yield*/, this.beforeInitTerminal()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.initTerminal(options, params)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.afterInitTerminal()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.initSDK()];
                    case 9:
                        _a.sent();
                        this.isStarted = true;
                        return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                                return service.getStartData();
                            }).catch(function (error) {
                                common_1.asyncThrow(error);
                                common_1.asyncThrow(new Error('[SAPPSDK] Can\'t get start datas from SAPP'));
                            })];
                    case 10:
                        data = _a.sent();
                        return [4 /*yield*/, this.onCreate(params, data)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, this.afterStart()];
                    case 12:
                        _a.sent();
                        this.started.resolve();
                        this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onStart();
                        }).catch(function (error) {
                            common_1.asyncThrow(error);
                            common_1.asyncThrow(new Error('[SAPPSDK] Can\'t notify onStart to SAPP'));
                        });
                        return [3 /*break*/, 14];
                    case 13:
                        e_1 = _a.sent();
                        this.onStartFailed();
                        this.isStarted = false;
                        this.started.reject(e_1);
                        throw e_1;
                    case 14: return [2 /*return*/];
                }
            });
        }); });
        /**
         * 获取主应用提供的Service，同步版本
         *
         * @type {ServServiceClient['getService']}
         * @memberof SappSDK
         *
         * @example
         * ``` ts
         * // 获取单个服务
         * const serv = app.getService(CommServiceDecl);
         * if (serv) {
         *     serv.func();
         * }
         *
         * or
         *
         * // 同时获取多个服务
         * const { serv } = app.getService({ serv: CommServiceDecl });
         * if (serv) {
         *     serv.func();
         * }
         * ```
         */
        _this.getService = function () {
            if (!this.isStarted) {
                return;
            }
            return this.terminal.client.getService(arguments[0]);
        };
        /**
         * 获取从应用提供的Service，与getService区别在于，返回值没有保证是否为undefined
         *
         * @type {ServServiceClient['getServiceUnsafe']}
         * @memberof SappSDK
         *
         * @example
         * ``` ts
         * const serv = app.getServiceUnsafe(CommServiceDecl);
         * serv.func(); // 没有 undefined 错误提示
         * ```
         */
        _this.getServiceUnsafe = function () {
            return this.getService.apply(this, arguments);
        };
        /**
         * 获取从应用提供的Service，异步版本
         *
         * @type {ServServiceClient['service']}
         * @memberof SappSDK
         *
         * @example
         * ``` ts
         * const serv = await app.service(CommServiceDecl);
         * ```
         */
        _this.service = function () {
            if (!this.isStarted) {
                return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
            }
            return this.terminal.client.service.apply(this.terminal.client, arguments);
        };
        /**
         * 获取从应用提供的Service，回调版本
         *
         * @type {ServServiceClient['serviceExec']}
         * @memberof SappSDK
         *
         * @example
         * ``` ts
         * app.serviceExec(CommServiceDecl, (serv) => {
         *     serv.func();
         * });
         */
        _this.serviceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
        };
        /**
         * 获取从应用向主应用提供的服务
         *
         * @type {ServServiceServer['getService']}
         * @memberof SappSDK
         */
        _this.getServerService = function () {
            if (!this.isStarted) {
                return;
            }
            return this.terminal.server.getService(arguments[0]);
        };
        /**
         * 获取从应用向主应用提供的服务
         *
         * @type {ServServiceServer['getServiceUnsafe']}
         * @memberof SappSDK
         */
        _this.getServerServiceUnsafe = function () {
            return this.getServerService.apply(this, arguments);
        };
        /**
         * 获取从应用向主应用提供的服务
         *
         * @type {ServServiceServer['service']}
         * @memberof SappSDK
         */
        _this.serverService = function () {
            if (!this.isStarted) {
                return Promise.reject(new Error('[SAPPSDK] SappSDK is not started'));
            }
            return this.terminal.server.service.apply(this.terminal.server, arguments);
        };
        /**
         * 获取从应用向主应用提供的服务
         *
         * @type {ServServiceServer['serviceExec']}
         * @memberof SappSDK
         */
        _this.serverServiceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
        };
        _this.started = Deferred_1.DeferredUtil.create();
        _this.setConfig({
        // Default Config
        });
        if (SappSDKMock_1.SappSDKMock.isMockEnabled()) {
            _this.sdkMock = new SappSDKMock_1.SappSDKMock(_this);
            // tslint:disable-next-line:no-console
            console.warn('[SAPPSDK]\n\nNOTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\nSAPPSDK MOCK FEATURE ENABLED.\n');
        }
        return _this;
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
     * 获取SappSDK使用的servkit
     *
     * @returns
     * @memberof SappSDK
     */
    SappSDK.prototype.getServkit = function () {
        return this.config.servkit || Servkit_1.servkit;
    };
    /**
     * 显式，会触发onShow回调
     *
     * @param {ShowParams} [params]
     * @returns
     * @memberof SappSDK
     */
    SappSDK.prototype.show = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                        return service.show(params);
                    })];
            });
        });
    };
    /**
     * 隐藏，会触发onHide回调
     *
     * @param {HideParams} [params]
     * @returns
     * @memberof SappSDK
     */
    SappSDK.prototype.hide = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                        return service.hide(params);
                    })];
            });
        });
    };
    SappSDK.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                        return service.close();
                    })];
            });
        });
    };
    SappSDK.prototype.beforeStart = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.beforeStart) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.beforeStart(this)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.emit(ESappSDKLifeCycleEvent.BEFORE_START, this);
                        return [2 /*return*/];
                }
            });
        });
    };
    SappSDK.prototype.afterStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.emit(ESappSDKLifeCycleEvent.AFTER_START, this);
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
    SappSDK.prototype.onStartFailed = function () {
        if (this.terminal) {
            this.terminal.servkit.destroyTerminal(this.terminal);
        }
        this.terminal = undefined;
    };
    SappSDK.prototype.resolveStartParams = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var resolveParams, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolveParams = undefined;
                        if (options.params) {
                            resolveParams =
                                typeof options.params === 'function'
                                    ? options.params
                                    : (function () { return options.params; });
                        }
                        else {
                            resolveParams = this.config.resolveStartParams;
                        }
                        if (!resolveParams) return [3 /*break*/, 2];
                        return [4 /*yield*/, resolveParams(this)];
                    case 1:
                        params = _a.sent();
                        return [2 /*return*/, params || {}];
                    case 2: return [2 /*return*/, this.getDefaultStartParams() || {}];
                }
            });
        });
    };
    SappSDK.prototype.beforeInitTerminal = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappSDK.prototype.initTerminal = function (options, params) {
        return __awaiter(this, void 0, void 0, function () {
            var config, terminalId, terminalConfig, _a, _b, services, service, _c, newTerminalConfig, self, SappLifecycleImpl, authInfo, _d, service, e_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        config = this.config;
                        terminalId = config.useTerminalId || params.uuid || '';
                        terminalConfig = {
                            id: terminalId,
                            type: ServTerminal_1.EServTerminal.SLAVE,
                            session: undefined,
                        };
                        if (!config.resolveServiceClientConfig) return [3 /*break*/, 2];
                        _a = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceClientConfig(this)];
                    case 1:
                        _a.client = _e.sent();
                        _e.label = 2;
                    case 2:
                        if (!config.resolveServiceServerConfig) return [3 /*break*/, 4];
                        _b = terminalConfig;
                        return [4 /*yield*/, config.resolveServiceServerConfig(this)];
                    case 3:
                        _b.server = _e.sent();
                        _e.label = 4;
                    case 4:
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
                        if (!config.resolveSessionConfig) return [3 /*break*/, 6];
                        _c = terminalConfig;
                        return [4 /*yield*/, config.resolveSessionConfig(this)];
                    case 5:
                        _c.session = _e.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        terminalConfig.session = {
                            channel: {
                                type: this.getAppType() === Sapp_1.ESappType.ASYNC_LOAD ? ServChannel_1.EServChannel.EVENT_LOADER : ServChannel_1.EServChannel.WINDOW,
                            },
                        };
                        _e.label = 7;
                    case 7:
                        if (!config.resolveTerminalConfig) return [3 /*break*/, 9];
                        return [4 /*yield*/, config.resolveTerminalConfig(this, terminalConfig)];
                    case 8:
                        newTerminalConfig = _e.sent();
                        if (newTerminalConfig) {
                            terminalConfig = newTerminalConfig;
                        }
                        _e.label = 9;
                    case 9:
                        // Rewrite type
                        terminalConfig.type = ServTerminal_1.EServTerminal.SLAVE;
                        terminalConfig.session.checkSession = true;
                        if (this.sdkMock) {
                            this.sdkMock.fixSlaveTerminalConfig(terminalConfig);
                        }
                        // Check config validation
                        if (!terminalConfig.id || !terminalConfig.session) {
                            throw new Error('[SAPPSDK] Invalid terminal config');
                        }
                        // Setup terminal
                        this.terminal = this.getServkit().createTerminal(terminalConfig);
                        self = this;
                        SappLifecycleImpl = /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            class_1.prototype.onShow = function (p) {
                                return self.onShow(p);
                            };
                            class_1.prototype.onHide = function (p) {
                                return self.onHide(p);
                            };
                            class_1.prototype.onClose = function () {
                                return self.onClose();
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
                        _e.sent();
                        _e.label = 11;
                    case 11:
                        _e.trys.push([11, 19, , 20]);
                        authInfo = void 0;
                        if (!this.config.authInfo) return [3 /*break*/, 15];
                        if (!(typeof this.config.authInfo === 'function')) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.config.authInfo(this)];
                    case 12:
                        _d = (_e.sent());
                        return [3 /*break*/, 14];
                    case 13:
                        _d = this.config.authInfo;
                        _e.label = 14;
                    case 14:
                        authInfo = _d;
                        return [3 /*break*/, 16];
                    case 15:
                        authInfo = {
                            token: '',
                        };
                        _e.label = 16;
                    case 16: return [4 /*yield*/, this.terminal.client.service(SappLifecycle_2.SappLifecycle)];
                    case 17:
                        service = _e.sent();
                        return [4 /*yield*/, service.auth(authInfo)];
                    case 18:
                        _e.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        e_2 = _e.sent();
                        common_1.asyncThrowMessage('[SappSDK] Auth failed');
                        throw e_2;
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    SappSDK.prototype.afterInitTerminal = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappSDK.prototype.initSDK = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappSDK.prototype.initSDKMock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappSDK.prototype.onCreate = function (params, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.onCreate) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.onCreate(this, params, data)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.emit(ESappSDKLifeCycleEvent.ON_CREATE, this, params, data);
                        return [2 /*return*/];
                }
            });
        });
    };
    SappSDK.prototype.onShow = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.onShow) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.onShow(this, params)];
                    case 1:
                        ret = _a.sent();
                        _a.label = 2;
                    case 2:
                        this.emit(ESappSDKLifeCycleEvent.ON_SHOW, this, params);
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    SappSDK.prototype.onHide = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.onHide) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.onHide(this, params)];
                    case 1:
                        ret = _a.sent();
                        _a.label = 2;
                    case 2:
                        this.emit(ESappSDKLifeCycleEvent.ON_HIDE, this, params);
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    SappSDK.prototype.onClose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.emit(ESappSDKLifeCycleEvent.ON_CLOSE, this);
                        if (!this.config.onClose) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.onClose(this)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取应用类型
     *
     * @returns {ESappType}
     * @memberof SappSDK
     */
    SappSDK.prototype.getAppType = function () {
        return Sapp_1.ESappType.IFRAME;
    };
    SappSDK.prototype.getDefaultStartParams = function () {
        return query_1.parseServQueryParams();
    };
    /**
     * 项目SappMGR中声明一个SappType.ASYNC_LOADD应用；必须在从应用加载阶段声明
     *
     * @static
     * @param {string} appId
     * @param {SappSDKAsyncLoadDeclParams} params
     * @memberof SappSDK
     *
     * @example
     * ``` ts
     * SappSDK.declAsyncLoad('com.servkit.example', {
     *     bootstrap: (sdk) => {
     *         sdk.setConfig({
     *             onCreate: () => { ... },
     *             onClose: () => { ... },
     *         });
     *         sdk.start();
     *     },
     * };
     * ```
     */
    SappSDK.declAsyncLoad = function (appId, params) {
        var sdk = undefined;
        var bootstrap = function () {
            if (sdk) {
                common_1.asyncThrow(new Error("[SAPPSDK] sdk is invalid for async load app " + appId + " on bootstrap"));
            }
            sdk = new SappAsyncLoadSDK(appId);
            params.bootstrap(sdk);
        };
        var deBootstrap = function () {
            try {
                if (params.deBootstrap) {
                    params.deBootstrap(sdk);
                }
            }
            catch (e) {
                common_1.asyncThrow(e);
            }
            sdk = undefined;
        };
        sharedParams_1.putAsyncLoadDeclContext(appId, {
            bootstrap: bootstrap,
            deBootstrap: deBootstrap,
        });
        try {
            if (SappSDKMock_1.SappSDKMock.isMockEnabled()) {
                SappSDKMock_1.SappSDKMock.tryAsynLoadBootstrap(appId);
            }
        }
        catch (e) {
            //
        }
    };
    return SappSDK;
}(eventemitter3_1.EventEmitter));
exports.SappSDK = SappSDK;
/**
 * SappType.ASYNC_LOAD应用的SDK
 *
 * @export
 * @class SappAsyncLoadSDK
 * @extends {SappSDK}
 */
var SappAsyncLoadSDK = /** @class */ (function (_super) {
    __extends(SappAsyncLoadSDK, _super);
    function SappAsyncLoadSDK(appId) {
        var _this = _super.call(this) || this;
        _this.appId = appId;
        return _this;
    }
    SappAsyncLoadSDK.prototype.getAppId = function () {
        return this.appId;
    };
    SappAsyncLoadSDK.prototype.getAppType = function () {
        return Sapp_1.ESappType.ASYNC_LOAD;
    };
    SappAsyncLoadSDK.prototype.getDefaultStartParams = function () {
        return sharedParams_1.getAsyncLoadStartParams(this.appId);
    };
    return SappAsyncLoadSDK;
}(SappSDK));
exports.SappAsyncLoadSDK = SappAsyncLoadSDK;
var sInstance = undefined;
try {
    sInstance = new SappSDK();
}
catch (e) {
    common_1.asyncThrow(e);
}
/**
 * 全局SappSDK
 */
exports.sappSDK = sInstance;
//# sourceMappingURL=SappSDK.js.map