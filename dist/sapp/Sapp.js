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
exports.Sapp = exports.SappInfo = exports.ESappType = exports.ESappLifePolicy = exports.ESappCreatePolicy = void 0;
var ServTerminal_1 = require("../terminal/ServTerminal");
var common_1 = require("../common/common");
var ServService_1 = require("../service/ServService");
var SappLifecycle_1 = require("./service/m/SappLifecycle");
var SappLifecycle_2 = require("./service/s/SappLifecycle");
var Deferred_1 = require("../common/Deferred");
var AsyncMutex_1 = require("../common/AsyncMutex");
var query_1 = require("../common/query");
/**
 * Sapp创建策略，当应用重复创建时，使用该枚举值进行控制
 */
var ESappCreatePolicy;
(function (ESappCreatePolicy) {
    ESappCreatePolicy[ESappCreatePolicy["NONE"] = 0] = "NONE";
    /**
     * 单例模式，重复创建应用会失败；默认值
     */
    ESappCreatePolicy[ESappCreatePolicy["SINGLETON"] = 1] = "SINGLETON";
    /**
     * 无限模式，可以创建任意多应用实例
     */
    ESappCreatePolicy[ESappCreatePolicy["INFINITE"] = 2] = "INFINITE";
})(ESappCreatePolicy = exports.ESappCreatePolicy || (exports.ESappCreatePolicy = {}));
/**
 * Sapp在隐藏时的生命管理策略；对于一些加载敏感的应用，可以使用显示/隐藏来提高应用的加载体验；而如果应用占优资源较多，隐藏时间过长时，则可以基于该枚举来控制是否直接关闭应用而释放资源
 */
var ESappLifePolicy;
(function (ESappLifePolicy) {
    ESappLifePolicy[ESappLifePolicy["NONE"] = 0] = "NONE";
    /**
     * 手动模式，在隐藏后，需要显式关闭应用；默认值
     */
    ESappLifePolicy[ESappLifePolicy["MANUAL"] = 1] = "MANUAL";
    /**
     * 自动模式，在隐藏超过lifeMaxHideTime时间后，应用自动被关闭
     */
    ESappLifePolicy[ESappLifePolicy["AUTO"] = 2] = "AUTO";
})(ESappLifePolicy = exports.ESappLifePolicy || (exports.ESappLifePolicy = {}));
/**
 * Sapp类型
 */
var ESappType;
(function (ESappType) {
    /**
     * 基于IFrame的应用，应用运行在一个IFrame Web上下文，与主应用运行环境完全隔离；默认值
     */
    ESappType["IFRAME"] = "IFRAME";
    /**
     * 基于异步机制的应用，应用与主应用运行在同一个Web环境；
     */
    ESappType["ASYNC_LOAD"] = "ASYNC_LOAD";
})(ESappType = exports.ESappType || (exports.ESappType = {}));
/**
 * Sapp信息
 */
var SappInfo = /** @class */ (function () {
    function SappInfo() {
    }
    return SappInfo;
}());
exports.SappInfo = SappInfo;
/**
 * 在主应用中，从应用抽象类；可通过Sapp实例操作从应用，并与从应用进行同行；
 *
 * Sapp主要提供：
 * 1：应用信息、生命周期状态
 * 2：生命周期操作API：start、show、hide、close
 * 3：服务通信
 *
 * 可通过SappController对Sapp做更多定制化控制
 *
 * @export
 * @class Sapp
 */
var Sapp = /** @class */ (function () {
    /**
     * 构造函数
     * @param {string} uuid 应用唯一ID
     * @param {SappInfo} info 应用信息
     * @param {SappMGR} manager 应用所属管理器
     * @memberof Sapp
     */
    function Sapp(uuid, info, manager) {
        var _this = this;
        this.mutex = new AsyncMutex_1.AsyncMutex();
        this.showHideMutex = new AsyncMutex_1.AsyncMutex();
        /**
         * 启动应用；具有防重入处理，重复的调用会得到第一次调用返回的Promise对象
         *
         * @param {SappStartOptions} options
         * @memberof Sapp
         */
        this.start = Deferred_1.DeferredUtil.reEntryGuard(this.mutex.lockGuard(function (options) { return __awaiter(_this, void 0, void 0, function () {
            var config, newOptions_1, timeout_1, timer_1, pTimeout_1, startWork, pWork, pDone, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isStarted) {
                            return [2 /*return*/];
                        }
                        if (this.closed.isFinished()) {
                            throw new Error("[SAPP] App has closed");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        config = this.config;
                        if (!config) {
                            throw new Error('[SAPP] Config must be set before start');
                        }
                        newOptions_1 = options || {};
                        timeout_1 = config.startTimeout
                            || this.info.options.startTimeout
                            || common_1.EServConstant.SERV_SAPP_ON_START_TIMEOUT;
                        timer_1 = 0;
                        pTimeout_1 = timeout_1 > 0 ? new Promise(function (resolve, reject) {
                            timer_1 = setTimeout(function () {
                                timer_1 = 0;
                                reject(new Error('timeout'));
                            }, timeout_1);
                        }) : undefined;
                        startWork = function () { return __awaiter(_this, void 0, void 0, function () {
                            var waitOnAuth, waitOnStart, asyncWorks, showParams, data;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        waitOnAuth = Deferred_1.DeferredUtil.create({
                                            rejectIf: pTimeout_1,
                                        });
                                        this.waitOnAuth = waitOnAuth;
                                        waitOnStart = Deferred_1.DeferredUtil.create({
                                            rejectIf: waitOnAuth,
                                        });
                                        this.waitOnStart = waitOnStart;
                                        return [4 /*yield*/, this.beforeStart(newOptions_1)];
                                    case 1:
                                        _a.sent();
                                        asyncWorks = this.controller ? this.controller.doAsyncStart() : undefined;
                                        if (!this.controller) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this.controller.doStart()];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [4 /*yield*/, this.beforeInitTerminal()];
                                    case 4:
                                        _a.sent();
                                        return [4 /*yield*/, this.initTerminal(newOptions_1)];
                                    case 5:
                                        _a.sent();
                                        return [4 /*yield*/, this.afterInitTerminal()];
                                    case 6:
                                        _a.sent();
                                        return [4 /*yield*/, waitOnAuth.catch(function (error) {
                                                if (_this.waitOnAuth) {
                                                    common_1.asyncThrow(new Error('[SAPP] App auth failed'));
                                                }
                                                throw error;
                                            })];
                                    case 7:
                                        _a.sent();
                                        this.waitOnAuth = undefined;
                                        return [4 /*yield*/, waitOnStart.catch(function (error) {
                                                if (_this.waitOnStart) {
                                                    common_1.asyncThrow(new Error('[SAPP] App start timeout'));
                                                }
                                                throw error;
                                            })];
                                    case 8:
                                        _a.sent();
                                        this.waitOnStart = undefined;
                                        if (!asyncWorks) return [3 /*break*/, 10];
                                        return [4 /*yield*/, asyncWorks];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10:
                                        this.isStarted = true;
                                        if (!this.controller) return [3 /*break*/, 12];
                                        return [4 /*yield*/, this.controller.doCreate()];
                                    case 11:
                                        _a.sent();
                                        _a.label = 12;
                                    case 12:
                                        if (!!this.config.hideOnStart) return [3 /*break*/, 15];
                                        showParams = {
                                            force: true,
                                        };
                                        return [4 /*yield*/, this.resolveStartShowData(newOptions_1)];
                                    case 13:
                                        data = _a.sent();
                                        if (data !== undefined) {
                                            showParams.data = data;
                                        }
                                        return [4 /*yield*/, this._show(showParams, true)];
                                    case 14:
                                        _a.sent();
                                        _a.label = 15;
                                    case 15: return [4 /*yield*/, this.afterStart()];
                                    case 16:
                                        _a.sent();
                                        this.started.resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        pWork = startWork();
                        pDone = pWork;
                        if (pTimeout_1) {
                            pDone = Promise.race([pWork, pTimeout_1]).then(function () {
                                if (timer_1) {
                                    clearTimeout(timer_1);
                                    timer_1 = 0;
                                }
                            }, function (error) {
                                if (timer_1) {
                                    clearTimeout(timer_1);
                                    timer_1 = 0;
                                }
                                throw error;
                            });
                        }
                        return [4 /*yield*/, pDone];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.started.reject(e_1);
                        this.close();
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        }); }));
        this._show = Deferred_1.DeferredUtil.reEntryGuard(this.showHideMutex.lockGuard(function (params, byCreate) { return __awaiter(_this, void 0, void 0, function () {
            var ret, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onShow(__assign(__assign({}, params), { byCreate: byCreate })).then(function (result) {
                                if (result && result.dontShow) {
                                    common_1.asyncThrow(new Error("[SAPP] Can't show app because rejection"));
                                }
                                return {
                                    dontShow: !!(result && result.dontShow),
                                };
                            }, function (error) {
                                common_1.asyncThrow(error);
                                common_1.asyncThrow(new Error("[SAPP] Can't show app because error"));
                                return {
                                    error: error,
                                };
                            });
                        }, function (error) {
                            common_1.asyncThrow(error);
                            common_1.asyncThrow(new Error("[SAPP] Can't show app because lifecycle service not provided"));
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
                        common_1.asyncThrow(e_2);
                        return [3 /*break*/, 5];
                    case 5:
                        this.showDone = Deferred_1.DeferredUtil.create();
                        return [2 /*return*/, true];
                    case 6:
                        if (ret.error) {
                            throw ret.error;
                        }
                        if (ret.dontShow) {
                            return [2 /*return*/, false];
                        }
                        throw new Error('unknow');
                }
            });
        }); }));
        this._hide = Deferred_1.DeferredUtil.reEntryGuard(this.showHideMutex.lockGuard(function (params, byClose) { return __awaiter(_this, void 0, void 0, function () {
            var ret, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
                            return service.onHide(__assign({ byClose: byClose }, params)).then(function (result) {
                                if (result && result.dontHide) {
                                    common_1.asyncThrow(new Error("[SAPP] Can't hide app because rejection"));
                                }
                                return {
                                    dontHide: !!(result && result.dontHide),
                                };
                            }, function (error) {
                                common_1.asyncThrow(error);
                                common_1.asyncThrow(new Error("[SAPP] Can't hide app because error"));
                                return {
                                    error: error,
                                };
                            });
                        }, function (error) {
                            common_1.asyncThrow(error);
                            common_1.asyncThrow(new Error("[SAPP] Can't hide app because lifecycle service not provided"));
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
                        common_1.asyncThrow(e_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, true];
                    case 6:
                        if (ret.error) {
                            throw ret.error;
                        }
                        if (ret.dontHide) {
                            return [2 /*return*/, false];
                        }
                        throw new Error('unknow');
                }
            });
        }); }));
        /**
         * 隐藏应用；具有防重入处理；result将会传递给SappSDK onClose回调；
         *
         * @param {SappCloseResult} result
         * @memberof Sapp
         */
        this.close = Deferred_1.DeferredUtil.reEntryGuard(this.mutex.lockGuard(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var onCloseResult, e_4, terminal_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isStarted) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.service(SappLifecycle_2.SappLifecycle).then(function (service) {
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
                            terminal_1 = this.terminal;
                            this.terminal = undefined;
                            // The close operation maybe from sapp, need to send back message;
                            // so lazy the destroy to next tick 
                            setTimeout(function () {
                                terminal_1.servkit.destroyTerminal(terminal_1);
                            });
                        }
                        this.detachController();
                        this.isStarted = false;
                        this.started = Deferred_1.DeferredUtil.reject(new Error('[SAPP] Closed'));
                        this.started.catch(function () { return undefined; });
                        this.waitOnStart = undefined;
                        this.waitOnAuth = undefined;
                        this.manager = undefined;
                        return [2 /*return*/, true];
                }
            });
        }); }));
        /**
         * 获取从应用提供的Service，同步版本
         *
         * @type {ServServiceClient['getService']}
         * @memberof Sapp
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
        this.getService = function () {
            if (!this.isStarted) {
                return;
            }
            return this.terminal.client.getService(arguments[0]);
        };
        /**
         * 获取从应用提供的Service，与getService区别在于，返回值没有保证是否为undefined
         *
         * @type {ServServiceClient['getServiceUnsafe']}
         * @memberof Sapp
         *
         * @example
         * ``` ts
         * const serv = app.getServiceUnsafe(CommServiceDecl);
         * serv.func(); // 没有 undefined 错误提示
         * ```
         */
        this.getServiceUnsafe = function () {
            return this.getService.apply(this, arguments);
        };
        /**
         * 获取从应用提供的Service，异步版本
         *
         * @type {ServServiceClient['service']}
         * @memberof Sapp
         *
         * @example
         * ``` ts
         * const serv = await app.service(CommServiceDecl);
         * ```
         */
        this.service = function () {
            if (!this.isStarted) {
                return Promise.reject(new Error('[SAPP] Sapp is not started'));
            }
            return this.terminal.client.service.apply(this.terminal.client, arguments);
        };
        /**
         * 获取从应用提供的Service，回调版本
         *
         * @type {ServServiceClient['serviceExec']}
         * @memberof Sapp
         *
         * @example
         * ``` ts
         * app.serviceExec(CommServiceDecl, (serv) => {
         *     serv.func();
         * });
         * ```
         */
        this.serviceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.client.serviceExec.apply(this.terminal.client, arguments);
        };
        /**
         * 获取主应用向从应用提供的服务
         *
         * @type {ServServiceServer['getService']}
         * @memberof Sapp
         */
        this.getServerService = function () {
            if (!this.isStarted) {
                return;
            }
            return this.terminal.server.getService(arguments[0]);
        };
        /**
         * 获取主应用向从应用提供的服务
         *
         * @type {ServServiceServer['getServiceUnsafe']}
         * @memberof Sapp
         */
        this.getServerServiceUnsafe = function () {
            return this.getServerService.apply(this, arguments);
        };
        /**
         * 获取主应用向从应用提供的服务
         *
         * @type {ServServiceServer['service']}
         * @memberof Sapp
         */
        this.serverService = function () {
            if (!this.isStarted) {
                return Promise.reject(new Error('[SAPP] Sapp is not started'));
            }
            return this.terminal.server.service.apply(this.terminal.server, arguments);
        };
        /**
         * 获取主应用向从应用提供的服务
         *
         * @type {ServServiceServer['serviceExec']}
         * @memberof Sapp
         */
        this.serverServiceExec = function () {
            if (!this.isStarted) {
                return null;
            }
            return this.terminal.server.serviceExec.apply(this.terminal.server, arguments);
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
    Sapp.transformContentByInfo = function (content, info) {
        return query_1.replacePlaceholders(content, { version: info.version });
    };
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
    /**
     * 获取应用关联的Controller
     *
     * @returns
     * @memberof Sapp
     */
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
    Sapp.prototype.getServkit = function () {
        return this.manager ? this.manager.getServkit() : undefined;
    };
    /**
     * 获取应用类型
     *
     * @returns {ESappType}
     * @memberof Sapp
     */
    Sapp.prototype.getAppType = function () {
        return this.info.type || ESappType.IFRAME;
    };
    /**
     * 显示应用，params.data会传递给SappSDK onShow回调
     *
     * @param {SappShowParams} [params]
     * @returns
     * @memberof Sapp
     */
    Sapp.prototype.show = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._show(params)];
            });
        });
    };
    /**
     * 隐藏应用，params.data会传递给SappSDK onHide回调
     *
     * @param {SappHideParams} [params]
     * @returns
     * @memberof Sapp
     */
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
                if (this.isClosed) {
                    return [2 /*return*/, Promise.reject('closed')];
                }
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
    Sapp.prototype.resolveStartShowData = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var resolveData;
            return __generator(this, function (_a) {
                resolveData = undefined;
                if (options.showData) {
                    resolveData =
                        typeof options.showData === 'function'
                            ? options.showData
                            : (function () { return options.showData; });
                }
                else {
                    resolveData = this.config.resolveStartShowData;
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
            var config, terminalConfig, _a, _b, _c, newTerminalConfig, aclResolver, self, SappLifecycleImpl, timeout;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        config = this.config;
                        terminalConfig = {
                            id: this.getTerminalId(),
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
                        _d.label = 6;
                    case 6:
                        if (!config.resolveTerminalConfig) return [3 /*break*/, 8];
                        return [4 /*yield*/, config.resolveTerminalConfig(this, terminalConfig)];
                    case 7:
                        newTerminalConfig = _d.sent();
                        if (newTerminalConfig) {
                            terminalConfig = newTerminalConfig;
                        }
                        _d.label = 8;
                    case 8:
                        // Rewrite type
                        terminalConfig.type = ServTerminal_1.EServTerminal.MASTER;
                        // Check config validation
                        if (!terminalConfig.id || !terminalConfig.session) {
                            throw new Error('[SAPP] Invalid terminal config');
                        }
                        aclResolver = config.resolveACLResolver ? config.resolveACLResolver(this) : undefined;
                        if (aclResolver) {
                            if (!terminalConfig.server) {
                                terminalConfig.server = {};
                            }
                            terminalConfig.server.ACLResolver = aclResolver;
                        }
                        // Setup terminal
                        this.terminal = this.getServkit().createTerminal(terminalConfig);
                        self = this;
                        SappLifecycleImpl = /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            class_1.prototype.onStart = function () {
                                var _this = this;
                                if (self.isClosed) {
                                    return ServService_1.API_ERROR('closed');
                                }
                                if (self.waitOnStart) {
                                    self.waitOnStart.resolve();
                                }
                                if (self.isStarted) { // For has started app, do show work
                                    Promise.resolve().then(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var showParams, data;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!self.isStarted) {
                                                        return [2 /*return*/];
                                                    }
                                                    showParams = {
                                                        force: true,
                                                    };
                                                    return [4 /*yield*/, self.resolveStartShowData(options)];
                                                case 1:
                                                    data = _a.sent();
                                                    if (data !== undefined) {
                                                        showParams.data = data;
                                                    }
                                                    self._show(showParams, true);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                }
                                return ServService_1.API_SUCCEED();
                            };
                            class_1.prototype.auth = function (params) {
                                if (self.isClosed) {
                                    return ServService_1.API_ERROR('closed');
                                }
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
                                if (self.isClosed) {
                                    return ServService_1.API_ERROR('closed');
                                }
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
                        timeout = config.startTimeout
                            || this.info.options.startTimeout
                            || common_1.EServConstant.SERV_SAPP_ON_START_TIMEOUT;
                        return [4 /*yield*/, this.terminal.openSession({ timeout: timeout, waiting: aclResolver ? aclResolver.init() : undefined })];
                    case 9:
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
    /**
     * servkit底层API，获取terminal id
     *
     * @returns
     * @memberof Sapp
     */
    Sapp.prototype.getTerminalId = function () {
        if (this.terminal) {
            return this.terminal.id;
        }
        return this.config.useTerminalId
            || this.info.options.useTerminalId
            || this.uuid;
    };
    return Sapp;
}());
exports.Sapp = Sapp;
//# sourceMappingURL=Sapp.js.map