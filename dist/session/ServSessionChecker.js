"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServSessionChecker = void 0;
var message_1 = require("../message");
var DEFAULT_OPTIONS = {
    interval: 10000,
    tryCount: 3,
};
var ServSessionChecker = /** @class */ (function () {
    function ServSessionChecker(session) {
        var _this = this;
        this.onCheck = function () {
            if (_this.session.isMaster()) {
                if (_this.lastCheckEchoTime !== _this.latestEchoTime) {
                    _this.checkCount = 0;
                    _this.lastCheckEchoTime = _this.latestEchoTime;
                }
                else {
                    ++_this.checkCount;
                    if (_this.checkCount >= _this.options.tryCount) {
                        _this.stop();
                        if (_this.options.onBroken) {
                            _this.options.onBroken(_this.session);
                        }
                    }
                }
            }
            else {
                _this.session.sendMessage(message_1.ServMessageCreator.create(message_1.EServMessage.SESSION_HEARTBREAK));
            }
        };
        this.session = session;
        this.resetCheckData();
    }
    ServSessionChecker.prototype.start = function (options) {
        if (this.isStarted) {
            this.stop();
        }
        this.isStarted = true;
        this.resetCheckData();
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.options.tryCount = Math.max(1, this.options.tryCount);
        this.options.interval = Math.max(5000, this.options.interval);
    };
    ServSessionChecker.prototype.startChecking = function () {
        if (!this.isStarted) {
            return;
        }
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(this.onCheck, this.options.interval);
        if (!this.session.isMaster()) {
            this.onCheck();
        }
    };
    ServSessionChecker.prototype.stop = function () {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = undefined;
        }
        this.resetCheckData();
        this.isStarted = false;
    };
    ServSessionChecker.prototype.handleEchoMessage = function (msg) {
        if (!this.isStarted) {
            return true;
        }
        this.latestEchoTime = Date.now();
        this.checkCount = 0;
        return true;
    };
    ServSessionChecker.prototype.resetCheckData = function () {
        this.checkCount = 0;
        this.latestEchoTime = -1;
        this.lastCheckEchoTime = -2;
    };
    return ServSessionChecker;
}());
exports.ServSessionChecker = ServSessionChecker;
//# sourceMappingURL=ServSessionChecker.js.map