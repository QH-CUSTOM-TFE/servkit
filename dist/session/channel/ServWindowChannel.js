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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServWindowChannel = void 0;
var common_1 = require("../../common/common");
var ServChannel_1 = require("./ServChannel");
var ServWindowChannel = /** @class */ (function (_super) {
    __extends(ServWindowChannel, _super);
    function ServWindowChannel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onWindowMessage = function (event) {
            if ((event.source && event.source === _this.windowInfo.window) || !event.data) {
                return;
            }
            _this.recvChannelPackage(event.data);
        };
        return _this;
    }
    ServWindowChannel.prototype.open = function () {
        var _this = this;
        if (!this.session) {
            return Promise.reject(new Error('unknown'));
        }
        if (this.isOpened()) {
            return Promise.resolve();
        }
        this.windowInfo = {
            target: null,
            window: null,
            origin: '*',
        };
        if (this.session.isMaster()) {
            var master_1 = this.config.master;
            if (!master_1) {
                return Promise.reject(new Error('Can\'t open channel without window.'));
            }
            var waitEcho = this.waitSlaveEcho();
            var windowInfo = master_1.createWindow(this);
            this.windowInfo.target = windowInfo.target;
            this.windowInfo.window = windowInfo.window || window;
            this.windowInfo.origin = windowInfo.origin || '*';
            this.windowInfo.element = windowInfo.element;
            this.attachMessageChannel();
            if (master_1.onCreate) {
                master_1.onCreate(this.windowInfo, this);
            }
            return waitEcho.then(function () {
                if (_this.recvable) {
                    _this.sendable = true;
                    if (master_1.onEcho) {
                        master_1.onEcho(_this.windowInfo, _this);
                    }
                    if (master_1.onOpened) {
                        master_1.onOpened(_this.windowInfo, _this);
                    }
                }
            }).catch(function (error) {
                _this.close();
                if (master_1.onOpenError) {
                    master_1.onOpenError(_this);
                }
                return Promise.reject(error);
            });
        }
        else {
            var slave = this.config.slave;
            var windowInfo = slave ? slave.getWindow(this) : undefined;
            this.windowInfo.target = (windowInfo && windowInfo.target) || window.parent || window;
            this.windowInfo.window = (windowInfo && windowInfo.window) || window;
            this.windowInfo.origin = (windowInfo && windowInfo.origin) || '*';
            this.windowInfo.element = (windowInfo && windowInfo.element);
            this.attachMessageChannel();
            this.sendable = true;
            this.slaveEcho();
            return Promise.resolve();
        }
    };
    ServWindowChannel.prototype.close = function () {
        if (!this.session) {
            return;
        }
        var oldOpened = this.isOpened();
        if (this.detachMessageChannel) {
            this.detachMessageChannel();
        }
        this.sendable = false;
        if (this.doWaitSlaveCleanWork) {
            this.doWaitSlaveCleanWork();
            this.doWaitSlaveCleanWork = undefined;
        }
        if (this.windowInfo.target || this.windowInfo.window) {
            if (this.session.isMaster() && this.config.master) {
                if (this.config.master.onDestroy) {
                    this.config.master.onDestroy(this.windowInfo, this);
                }
                this.config.master.destroyWindow(this.windowInfo, this);
            }
            this.windowInfo.target = undefined;
            this.windowInfo.window = undefined;
            this.windowInfo.origin = '';
            this.windowInfo.element = undefined;
        }
        if (oldOpened && this.session.isMaster() && this.config.master) {
            if (this.config.master.onClosed) {
                this.config.master.onClosed(this);
            }
        }
    };
    ServWindowChannel.prototype.waitSlaveEcho = function () {
        var _this = this;
        var master = this.config.master;
        if (!master || master.dontWaitEcho) {
            return Promise.resolve();
        }
        var res;
        var p = new Promise(function (resolve, reject) {
            res = resolve;
        });
        var onSlaveEcho = function (event) {
            if ((event.source && event.source === _this.windowInfo.window) || !event.data) {
                return;
            }
            var chnPkg = event.data;
            if (chnPkg !== ("slaveecho$$" + _this.session.getID() + "$$")) {
                return;
            }
            res();
        };
        window.addEventListener('message', onSlaveEcho, false);
        this.doWaitSlaveCleanWork = function () {
            window.removeEventListener('message', onSlaveEcho);
        };
        return p.then(function () {
            if (_this.doWaitSlaveCleanWork) {
                _this.doWaitSlaveCleanWork();
                _this.doWaitSlaveCleanWork = undefined;
            }
        }, function (e) {
            if (_this.doWaitSlaveCleanWork) {
                _this.doWaitSlaveCleanWork();
                _this.doWaitSlaveCleanWork = undefined;
            }
            return Promise.reject(e);
        });
    };
    ServWindowChannel.prototype.slaveEcho = function () {
        var chnPkg = "slaveecho$$" + this.session.getID() + "$$";
        this.sendChannelPackage(chnPkg);
    };
    ServWindowChannel.prototype.attachMessageChannel = function () {
        var _this = this;
        var chnWindow = this.windowInfo.window;
        if (!chnWindow) {
            common_1.asyncThrow(new Error('[SERVKIT] No window, attachMessageChannel failed.'));
            return;
        }
        chnWindow.addEventListener('message', this.onWindowMessage, false);
        this.recvable = true;
        this.detachMessageChannel = function () {
            _this.recvable = false;
            chnWindow.removeEventListener('message', _this.onWindowMessage);
        };
    };
    ServWindowChannel.prototype.sendChannelPackage = function (msg) {
        var targetWindow = this.windowInfo.target;
        if (!targetWindow) {
            common_1.asyncThrow(new Error('[SERVKIT] No target window, package send failed.'));
            return false;
        }
        var targetOrigin = this.windowInfo.origin;
        try {
            // Try send object message
            targetWindow.postMessage(msg, targetOrigin);
            return true;
        }
        catch (e) {
            common_1.asyncThrow(e);
        }
        return false;
    };
    return ServWindowChannel;
}(ServChannel_1.ServChannel));
exports.ServWindowChannel = ServWindowChannel;
//# sourceMappingURL=ServWindowChannel.js.map