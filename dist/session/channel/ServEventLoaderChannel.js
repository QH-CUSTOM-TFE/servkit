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
exports.ServEventLoaderChannel = void 0;
var ServEventChannel_1 = require("./ServEventChannel");
var Deferred_1 = require("../../common/Deferred");
var common_1 = require("../../common/common");
var ServEventLoaderChannel = /** @class */ (function (_super) {
    __extends(ServEventLoaderChannel, _super);
    function ServEventLoaderChannel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServEventLoaderChannel.prototype.open = function () {
        var _this = this;
        if (this.isOpened()) {
            return Promise.resolve();
        }
        _super.prototype.open.call(this);
        this.sendable = false;
        if (this.session.isMaster()) {
            var master_1 = this.config.master;
            if (!master_1) {
                throw new Error('Can\'t open channel without window.');
            }
            var waitEcho_1 = this.waitSlaveEcho();
            var loader = master_1.createLoader(this);
            if (master_1.onCreate) {
                master_1.onCreate(this.loader, this);
            }
            return loader.load().then(function () {
                return waitEcho_1;
            }).then(function () {
                if (_this.recvable) {
                    _this.sendable = true;
                    if (master_1.onEcho) {
                        master_1.onEcho(_this.loader, _this);
                    }
                    if (master_1.onOpened) {
                        master_1.onOpened(_this.loader, _this);
                    }
                }
            }).catch(function (error) {
                if (master_1.onOpenError) {
                    common_1.safeExec(function () { return master_1.onOpenError(_this); });
                }
                _this.close();
                return Promise.reject(error);
            });
        }
        else {
            this.sendable = true;
            this.slaveEcho();
            return Promise.resolve();
        }
    };
    ServEventLoaderChannel.prototype.close = function () {
        if (!this.session) {
            return;
        }
        var oldOpened = this.isOpened();
        _super.prototype.close.call(this);
        if (this.loader) {
            if (this.session.isMaster() && this.config.master) {
                if (this.config.master.onDestroy) {
                    this.config.master.onDestroy(this.loader, this);
                }
                this.config.master.destroyLoader(this.loader, this);
            }
            this.loader = undefined;
        }
        if (oldOpened && this.session.isMaster() && this.config.master) {
            if (this.config.master.onClosed) {
                this.config.master.onClosed(this);
            }
        }
    };
    ServEventLoaderChannel.prototype.waitSlaveEcho = function () {
        var _this = this;
        var master = this.config.master;
        if (!master || master.dontWaitEcho) {
            return Promise.resolve();
        }
        var wait = Deferred_1.DeferredUtil.create();
        this.tryWaitSlaveEcho = function (msg) {
            if (msg !== ("slaveecho$$" + _this.session.getID() + "$$")) {
                return;
            }
            wait.resolve();
        };
        this.doWaitSlaveCleanWork = function () {
            _this.tryWaitSlaveEcho = undefined;
        };
        return wait.then(function () {
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
    ServEventLoaderChannel.prototype.recvChannelPackage = function (msg) {
        if (this.tryWaitSlaveEcho) {
            this.tryWaitSlaveEcho(msg);
            return;
        }
        _super.prototype.recvChannelPackage.call(this, msg);
    };
    ServEventLoaderChannel.prototype.slaveEcho = function () {
        var chnPkg = "slaveecho$$" + this.session.getID() + "$$";
        this.sendChannelPackage(chnPkg);
    };
    return ServEventLoaderChannel;
}(ServEventChannel_1.ServEventChannel));
exports.ServEventLoaderChannel = ServEventLoaderChannel;
//# sourceMappingURL=ServEventLoaderChannel.js.map