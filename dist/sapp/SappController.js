"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SappController = void 0;
var SappMGR_1 = require("./SappMGR");
var index_1 = require("../common/index");
var SappController = /** @class */ (function () {
    function SappController(app) {
        app.attachController(this);
        index_1.aspectBefore(this, 'doShow', this.doShowBeforeAspect);
        index_1.aspectAfter(this, 'doHide', this.doHideAfterAspect);
        index_1.aspectAfter(this, 'doClose', this.doCloseAfterAspect);
    }
    SappController.prototype.doConfig = function (options) {
        var _this = this;
        var app = this.app;
        var config = {
            resolveServiceServerConfig: function () {
                return _this.resolveServiceServerConfig(options);
            },
            resolveSessionConfig: function () {
                return _this.resolveSessionConfig(options);
            },
        };
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
        app.setConfig(config);
    };
    SappController.prototype.doCreate = function () {
        //
    };
    SappController.prototype.doShow = function () {
        //
    };
    SappController.prototype.doHide = function () {
        //
    };
    SappController.prototype.doClose = function (result) {
        //
    };
    SappController.prototype.doHideAfterAspect = function () {
        var _this = this;
        var life = this.app.info.options.life;
        if (life === SappMGR_1.ESappLifePolicy.MANUAL) {
            return;
        }
        if (this.cleanHideLifeChecker) {
            this.cleanHideLifeChecker();
        }
        var maxHideTime = index_1.EServConstant.SAPP_HIDE_MAX_TIME;
        if (this.app.info.options.lifeMaxHideTime > 0) {
            maxHideTime = Math.max(this.app.info.options.lifeMaxHideTime, index_1.EServConstant.SAPP_HIDE_MAX_TIME * 0.5);
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
            serviceRefer: /.*/,
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