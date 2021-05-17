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
exports.SappController = void 0;
var Sapp_1 = require("./Sapp");
var common_1 = require("../common/common");
var aspect_1 = require("../common/aspect");
var SappController = /** @class */ (function () {
    function SappController(app) {
        app.attachController(this);
        aspect_1.aspectBefore(this, 'doShow', this.doShowBeforeAspect);
        aspect_1.aspectAfter(this, 'doHide', this.doHideAfterAspect);
        aspect_1.aspectAfter(this, 'doClose', this.doCloseAfterAspect);
    }
    SappController.prototype.setLayoutOptions = function (options) {
        if (options === void 0) { options = {}; }
        if (this.app.isStarted || this.app.start.deferred || this.app.isClosed) {
            common_1.asyncThrowMessage('App has started, can\'t set layout');
            return;
        }
        if (typeof options === 'function') {
            options = options(this.app);
        }
        this.resetLayout(options);
    };
    SappController.prototype.doConfig = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var app, config;
            var _this = this;
            return __generator(this, function (_a) {
                app = this.app;
                this.setLayoutOptions(options.layout);
                config = {
                    beforeStart: function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, this.beforeStart()];
                        });
                    }); },
                    afterStart: function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, this.afterStart()];
                        });
                    }); },
                    resolveServiceServerConfig: function () {
                        return _this.resolveServiceServerConfig(options);
                    },
                    resolveSessionConfig: function () {
                        return _this.resolveSessionConfig(options);
                    },
                };
                if (options.startTimeout !== undefined) {
                    config.startTimeout = options.startTimeout;
                }
                if (options.useTerminalId !== undefined) {
                    config.useTerminalId = options.useTerminalId;
                }
                if (options.startData !== undefined) {
                    config.resolveStartData = typeof options.startData === 'function'
                        ? options.startData
                        : (function () { return options.startData; });
                }
                if (options.startShowData !== undefined) {
                    config.resolveStartShowData = typeof options.startShowData === 'function'
                        ? options.startShowData
                        : (function () { return options.startShowData; });
                }
                if (options.createACLResolver) {
                    config.resolveACLResolver = function () {
                        return options.createACLResolver(app);
                    };
                }
                app.setConfig(config);
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doAsyncStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doCreate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doShow = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doHide = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doClose = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doAuth = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.beforeStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.afterStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    SappController.prototype.doHideAfterAspect = function () {
        var _this = this;
        var life = this.app.info.options.life;
        if (life !== Sapp_1.ESappLifePolicy.AUTO) {
            return;
        }
        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }
        var maxHideTime = common_1.EServConstant.SAPP_HIDE_MAX_TIME;
        if (this.app.info.options.lifeMaxHideTime > 0) {
            maxHideTime = Math.max(this.app.info.options.lifeMaxHideTime, common_1.EServConstant.SAPP_HIDE_MAX_TIME * 0.5);
        }
        var timer = setTimeout(function () {
            timer = 0;
            if (_this.app) {
                _this.app.close({
                    error: new Error('hide_timeout'),
                });
            }
        }, maxHideTime);
        this.cleanHideLifeChecker = function () {
            _this.cleanHideLifeChecker = undefined;
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
        };
    };
    SappController.prototype.doShowBeforeAspect = function () {
        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }
    };
    SappController.prototype.doCloseAfterAspect = function () {
        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }
    };
    SappController.prototype.resolveServiceClientConfig = function (options) {
        return {};
    };
    SappController.prototype.resolveServiceServerConfig = function (options) {
        return {
            service: options.services ? { services: options.services } : undefined,
            serviceRefer: options.serviceRefer || /.*/,
        };
    };
    SappController.prototype.resolveSessionConfig = function (options) {
        var _this = this;
        return {
            checkSession: true,
            checkOptions: {
                onBroken: function () {
                    _this.onSessionBroken();
                },
            },
            channel: this.resolveSessionChannelConfig(options),
        };
    };
    SappController.prototype.resolveSessionChannelConfig = function (options) {
        throw new Error('[SAPPMGR] Unsupport');
    };
    SappController.prototype.onSessionBroken = function () {
        if (this.app) {
            this.app.close({
                error: new Error('session_broken'),
            });
        }
    };
    SappController.prototype.onAttach = function (app) {
        if (this.app === app) {
            return false;
        }
        if (this.app && this.app !== app) {
            this.app.detachController();
        }
        this.app = app;
        return true;
    };
    SappController.prototype.onDetach = function (app) {
        if (this.app !== app) {
            return false;
        }
        this.app = undefined;
    };
    return SappController;
}());
exports.SappController = SappController;
//# sourceMappingURL=SappController.js.map