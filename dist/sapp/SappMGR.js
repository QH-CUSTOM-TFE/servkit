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
exports.sappMGR = exports.SappMGR = exports.SappLayoutOptions = exports.SappInfo = exports.ESappType = exports.ESappLifePolicy = exports.ESappCreatePolicy = void 0;
var Sapp_1 = require("./Sapp");
var Servkit_1 = require("../servkit/Servkit");
var SappDefaultIFrameController_1 = require("./SappDefaultIFrameController");
var common_1 = require("../common");
var SappPlainPage_1 = require("./SappPlainPage");
var ESappCreatePolicy;
(function (ESappCreatePolicy) {
    ESappCreatePolicy[ESappCreatePolicy["NONE"] = 0] = "NONE";
    ESappCreatePolicy[ESappCreatePolicy["SINGLETON"] = 1] = "SINGLETON";
    ESappCreatePolicy[ESappCreatePolicy["INFINITE"] = 2] = "INFINITE";
})(ESappCreatePolicy = exports.ESappCreatePolicy || (exports.ESappCreatePolicy = {}));
var ESappLifePolicy;
(function (ESappLifePolicy) {
    ESappLifePolicy[ESappLifePolicy["NONE"] = 0] = "NONE";
    ESappLifePolicy[ESappLifePolicy["AUTO"] = 1] = "AUTO";
    ESappLifePolicy[ESappLifePolicy["MANUAL"] = 2] = "MANUAL";
})(ESappLifePolicy = exports.ESappLifePolicy || (exports.ESappLifePolicy = {}));
var ESappType;
(function (ESappType) {
    ESappType["IFRAME"] = "iframe";
})(ESappType = exports.ESappType || (exports.ESappType = {}));
var SappInfo = /** @class */ (function () {
    function SappInfo() {
    }
    return SappInfo;
}());
exports.SappInfo = SappInfo;
var SappLayoutOptions = /** @class */ (function () {
    function SappLayoutOptions() {
    }
    return SappLayoutOptions;
}());
exports.SappLayoutOptions = SappLayoutOptions;
var SappMGR = /** @class */ (function () {
    function SappMGR() {
        this.getService = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.getService.apply(serviceManager, arguments);
        };
        this.getServiceUnsafe = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.getServiceUnsafe.apply(serviceManager, arguments);
        };
        this.service = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.service.apply(serviceManager, arguments);
        };
        this.serviceExec = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.serviceExec.apply(serviceManager, arguments);
        };
        this.addServices = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.addServices.apply(serviceManager, arguments);
        };
        this.remServices = function () {
            var serviceManager = this.getServkit().service;
            return serviceManager.remServices.apply(serviceManager, arguments);
        };
        this.infos = {};
        this.apps = {};
        this.nextId = Date.now();
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
    SappMGR.prototype.getApp = function (id) {
        return this.getApps(id)[0];
    };
    SappMGR.prototype.getApps = function (id) {
        return this.apps[id] || [];
    };
    SappMGR.prototype.getAppInfo = function (id) {
        return this.infos[id];
    };
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
                            this.infos[id] = info;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, info];
                }
            });
        });
    };
    SappMGR.prototype.create = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var app, info;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        app = this.getApp(id);
                        if (app) {
                            if (!app.info.options.create || app.info.options.create === ESappCreatePolicy.SINGLETON) {
                                throw new Error('singleton');
                            }
                        }
                        return [4 /*yield*/, this.loadAppInfo(id)];
                    case 1:
                        info = _a.sent();
                        if (!info) {
                            throw new Error("[SAPPMGR] App " + id + " is not exits");
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
        return new SappDefaultIFrameController_1.SappDefaultIFrameController(app);
    };
    return SappMGR;
}());
exports.SappMGR = SappMGR;
exports.sappMGR = new SappMGR();
//# sourceMappingURL=SappMGR.js.map