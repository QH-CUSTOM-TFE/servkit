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
exports.sappMGR = exports.SappMGR = exports.SappLayoutOptions = void 0;
var Sapp_1 = require("./Sapp");
var Servkit_1 = require("../servkit/Servkit");
var SappDefaultIFrameController_1 = require("./SappDefaultIFrameController");
var common_1 = require("../common/common");
var SappPlainPage_1 = require("./SappPlainPage");
var SappDefaultAsyncLoadController_1 = require("./SappDefaultAsyncLoadController");
var SappPreloader_1 = require("./SappPreloader");
var DEFAULT_APP_INFO_OPTIONS = {
    create: Sapp_1.ESappCreatePolicy.SINGLETON,
    life: Sapp_1.ESappLifePolicy.MANUAL,
};
var DEFAULT_APP_INFO = {
    id: '',
    version: '',
    name: '',
    type: Sapp_1.ESappType.IFRAME,
    url: '',
    options: DEFAULT_APP_INFO_OPTIONS,
};
/**
 * Sapp布局配置项
 *
 * @export
 * @class SappLayoutOptions
 *
 * @example
 * ``` ts
 * // layout管理容器元素
 * const container = document.createElement('div');
 * // some code to config container class and style
 * ...
 * // 实际的layout options
 * const layout = {
 *     container,
 *     onStart: () => { document.body.appendChild(container); },
 *     onClose: () => { document.body.removeChild(container); }
 * };
 *
 * ```
 */
var SappLayoutOptions = /** @class */ (function () {
    function SappLayoutOptions() {
    }
    return SappLayoutOptions;
}());
exports.SappLayoutOptions = SappLayoutOptions;
/**
 * 应用管理器，主要提供了：
 * 1：Sapp管理
 * 2：全局服务管理
 *
 * @export
 * @class SappMGR
 */
var SappMGR = /** @class */ (function () {
    function SappMGR() {
        /**
         * 获取全局服务，参见Sapp.getService
         *
         * @type {ServGlobalServiceManager['getService']}
         * @memberof SappMGR
         */
        this.getService = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.getService.apply(serviceManager, arguments);
        };
        /**
         * 获取全局服务，参见Sapp.getServiceUnsafe
         *
         * @type {ServGlobalServiceManager['getServiceUnsafe']}
         * @memberof SappMGR
         */
        this.getServiceUnsafe = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.getServiceUnsafe.apply(serviceManager, arguments);
        };
        /**
         * 获取全局服务，参见Sapp.service
         *
         * @type {ServGlobalServiceManager['service']}
         * @memberof SappMGR
         */
        this.service = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.service.apply(serviceManager, arguments);
        };
        /**
         * 获取全局服务，参见Sapp.serviceExec
         *
         * @type {ServGlobalServiceManager['serviceExec']}
         * @memberof SappMGR
         */
        this.serviceExec = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.serviceExec.apply(serviceManager, arguments);
        };
        /**
         * 添加服务到全局服务中，全局服务可以被任意从应用使用
         *
         * @type {ServGlobalServiceManager['addServices']}
         * @memberof SappMGR
         */
        this.addServices = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.addServices.apply(serviceManager, arguments);
        };
        /**
         * 移除全局服务
         *
         * @type {ServGlobalServiceManager['remServices']}
         * @memberof SappMGR
         */
        this.remServices = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.remServices.apply(serviceManager, arguments);
        };
        this.infos = {};
        this.apps = {};
        this.setConfig({});
    }
    SappMGR.prototype.setConfig = function (config) {
        this.config = config;
        return this;
    };
    SappMGR.prototype.getServkit = function () {
        return this.config.servkit || Servkit_1.servkit;
    };
    SappMGR.prototype.getConfig = function () {
        return this.config;
    };
    /**
     * 根据id获取Sapp实例
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    SappMGR.prototype.getApp = function (id) {
        return this.getApps(id)[0];
    };
    /**
     * 根据id获取所有的Sapp实例
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    SappMGR.prototype.getApps = function (id) {
        return this.apps[id] || [];
    };
    /**
     * 根据id获取SappInfo
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    SappMGR.prototype.getAppInfo = function (id) {
        return this.infos[id];
    };
    /**
     * 添加SappInfo到管理器中
     *
     * @param {SappInfo} info
     * @returns {(SappInfo | undefined)}
     * @memberof SappMGR
     */
    SappMGR.prototype.addAppInfo = function (info) {
        if (!info.id) {
            return;
        }
        var oldInfo = info;
        info = Object.assign({}, DEFAULT_APP_INFO, oldInfo);
        if (oldInfo.options) {
            info.options = Object.assign({}, DEFAULT_APP_INFO_OPTIONS, oldInfo.options);
        }
        if (info.type === Sapp_1.ESappType.ASYNC_LOAD) {
            info.options.create = Sapp_1.ESappCreatePolicy.SINGLETON;
        }
        this.infos[info.id] = info;
        return info;
    };
    /**
     * 根据id移除SappInfo
     *
     * @param {string} id
     * @returns
     * @memberof SappMGR
     */
    SappMGR.prototype.remAppInfo = function (id) {
        var info = this.infos[id];
        if (!info) {
            return info;
        }
        delete this.infos[id];
        return info;
    };
    /**
     * 根据id获取SappInfo，如果SappMGR.getAppInfo不能获取，则尝试通过SappConfig.loadAppInfo进行加载
     *
     * @param {string} id
     * @returns {(Promise<SappInfo | undefined>)}
     * @memberof SappMGR
     */
    SappMGR.prototype.loadAppInfo = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        info = this.getAppInfo(id);
                        if (info) {
                            return [2 /*return*/, info];
                        }
                        if (!this.config.loadAppInfo) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.loadAppInfo(this, id).catch(function () { return undefined; })];
                    case 1:
                        info = _a.sent();
                        if (info) {
                            this.addAppInfo(info);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.getAppInfo(id)];
                }
            });
        });
    };
    /**
     * 预加载一个应用，只有SappType.ASYNC_LOAD应用才能够预加载
     *
     * @param {(string | SappInfo)} id
     * @returns {Promise<boolean>}
     * @memberof SappMGR
     */
    SappMGR.prototype.preload = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var info, app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof id === 'object') {
                            info = id;
                            id = id.id;
                        }
                        app = this.getApp(id);
                        if (app && app.isStarted) { // Has Create 
                            return [2 /*return*/, true];
                        }
                        if (!info) return [3 /*break*/, 1];
                        info = this.addAppInfo(info);
                        if (!info) {
                            return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.loadAppInfo(id).catch(function () { return undefined; })];
                    case 2:
                        info = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!info) {
                            return [2 /*return*/, false];
                        }
                        if (info.type !== Sapp_1.ESappType.ASYNC_LOAD || info.options.isPlainPage) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, SappPreloader_1.SappPreloader.instance.load(info).then(function () {
                                return true;
                            }, function () {
                                return false;
                            })];
                }
            });
        });
    };
    /**
     * 根据id或者info创建一个应用；默认应用会自动start，可通过options.dontStartOnCreate控制是否自动start应用
     *
     * @param {(string | SappInfo)} id
     * @param {SappCreateOptions} [options]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    SappMGR.prototype.create = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var app, info;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof id === 'object') {
                            if (!this.addAppInfo(id)) {
                                throw new Error("[SAPPMGR] App info is invalid");
                            }
                            id = id.id;
                        }
                        app = this.getApp(id);
                        if (app) {
                            if (!app.info.options.create || app.info.options.create === Sapp_1.ESappCreatePolicy.SINGLETON) {
                                throw new Error('singleton');
                            }
                        }
                        return [4 /*yield*/, this.loadAppInfo(id)];
                    case 1:
                        info = _a.sent();
                        if (!info) {
                            throw new Error("[SAPPMGR] App " + id + " is not exits");
                        }
                        options = options || {};
                        if (!options.createACLResolver && this.config.createACLResolver) {
                            options.createACLResolver = this.config.createACLResolver;
                        }
                        app = this.createApp(this.nextAppUuid(info), info, options);
                        this.addApp(app);
                        app.closed.then(function () {
                            _this.remApp(app);
                        }, function () {
                            _this.remApp(app);
                        });
                        app.getController().doConfig(options);
                        if (!(!options.dontStartOnCreate && !info.options.dontStartOnCreate)) return [3 /*break*/, 3];
                        return [4 /*yield*/, app.start()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, app];
                }
            });
        });
    };
    /**
     * 根据id显示应用
     *
     * @param {string} id
     * @param {SappShowParams} [params]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    SappMGR.prototype.show = function (id, params) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this.getApp(id);
                        if (!app) {
                            return [2 /*return*/, Promise.reject(new Error("[SAPPMGR] App " + id + " has not created"))];
                        }
                        return [4 /*yield*/, app.show(params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, app];
                }
            });
        });
    };
    /**
     * 根据id隐藏应用
     *
     * @param {string} id
     * @param {SappHideParams} [params]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    SappMGR.prototype.hide = function (id, params) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this.getApp(id);
                        if (!app) {
                            return [2 /*return*/, Promise.reject(new Error("[SAPPMGR] App " + id + " has not created"))];
                        }
                        return [4 /*yield*/, app.hide(params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, app];
                }
            });
        });
    };
    /**
     * 根据id关闭应用
     *
     * @param {string} id
     * @param {SappCloseResult} [result]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    SappMGR.prototype.close = function (id, result) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this.getApp(id);
                        if (!app) {
                            return [2 /*return*/, Promise.reject(new Error("[SAPPMGR] App " + id + " has not created"))];
                        }
                        return [4 /*yield*/, app.close(result)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, app];
                }
            });
        });
    };
    /**
     * 根据id创建或者显示应用；如果应用不存在则创建应用，如果应用已经存在则隐藏应用
     *
     * @param {string} id
     * @param {SappCreateOptions} [options]
     * @returns {Promise<Sapp>}
     * @memberof SappMGR
     */
    SappMGR.prototype.createOrShow = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var app, params;
            return __generator(this, function (_a) {
                app = this.getApp(id);
                if (app) {
                    params = {
                        force: true,
                    };
                    if (options && options.startShowData !== undefined) {
                        if (typeof options.startShowData === 'function') {
                            params.data = options.startShowData(app);
                        }
                        else {
                            params.data = options.startShowData;
                        }
                    }
                    return [2 /*return*/, this.show(id, params)];
                }
                else {
                    return [2 /*return*/, this.create(id, options)];
                }
                return [2 /*return*/];
            });
        });
    };
    SappMGR.prototype.addApp = function (app) {
        var apps = this.apps[app.info.id];
        if (!apps) {
            apps = [];
            this.apps[app.info.id] = apps;
        }
        else {
            if (apps.indexOf(app) >= 0) {
                return false;
            }
        }
        apps.push(app);
        return true;
    };
    SappMGR.prototype.remApp = function (app) {
        var apps = this.apps[app.info.id];
        if (!apps) {
            return false;
        }
        var i = apps.indexOf(app);
        if (i >= 0) {
            apps.splice(i, 1);
            return true;
        }
        return false;
    };
    SappMGR.prototype.nextAppUuid = function (info) {
        return info.id + "-" + common_1.nextUUID();
    };
    SappMGR.prototype.createApp = function (uuid, info, options) {
        var app = info.options.isPlainPage ? new SappPlainPage_1.SappPlainPage(uuid, info, this) : new Sapp_1.Sapp(uuid, info, this);
        this.createAppController(app, options);
        return app;
    };
    SappMGR.prototype.createAppController = function (app, options) {
        if (options.createAppController) {
            return options.createAppController(this, app);
        }
        if (this.config.createAppController) {
            return this.config.createAppController(this, app);
        }
        return this.createDefaultAppController(app);
    };
    SappMGR.prototype.createDefaultAppController = function (app) {
        return app.info.type === Sapp_1.ESappType.ASYNC_LOAD
            ? new SappDefaultAsyncLoadController_1.SappDefaultAsyncLoadController(app)
            : new SappDefaultIFrameController_1.SappDefaultIFrameController(app);
    };
    /**
     * 创建SappMGR实例
     *
     * @static
     * @param {SappMGRConfig} [config={}]
     * @returns {SappMGR}
     * @memberof SappMGR
     */
    SappMGR.create = function (config) {
        var mgr = new SappMGR();
        mgr.setConfig(config);
        return mgr;
    };
    return SappMGR;
}());
exports.SappMGR = SappMGR;
var sInstance = undefined;
try {
    sInstance = new SappMGR();
}
catch (e) {
    common_1.asyncThrow(e);
}
/**
 * 全局SappMGR实例
 */
exports.sappMGR = sInstance;
//# sourceMappingURL=SappMGR.js.map