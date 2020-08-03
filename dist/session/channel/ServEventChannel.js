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
exports.ServEventChannel = void 0;
var ServChannel_1 = require("./ServChannel");
var ServEventChannel = /** @class */ (function (_super) {
    __extends(ServEventChannel, _super);
    function ServEventChannel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onEventMessage = function (event) {
            var pkg = event.detail;
            if (!event.detail) {
                return;
            }
            _this.recvChannelPackage(pkg);
        };
        return _this;
    }
    ServEventChannel.prototype.init = function (session, config) {
        if (config && config.ignoreSenderType) {
            config.ignoreSenderType = false;
        }
        _super.prototype.init.call(this, session, config);
        this.asyncDispatchPromise = Promise.resolve();
    };
    ServEventChannel.prototype.open = function () {
        if (!this.session) {
            return Promise.reject(new Error('unknown'));
        }
        if (this.isOpened()) {
            return Promise.resolve();
        }
        this.attachMessageChannel();
        this.sendable = true;
        return Promise.resolve();
    };
    ServEventChannel.prototype.close = function () {
        if (!this.session) {
            return;
        }
        this.detachMessageChannel();
        this.sendable = false;
    };
    ServEventChannel.prototype.attachMessageChannel = function () {
        window.addEventListener(this.recvStringMark, this.onEventMessage, false);
        this.recvable = true;
    };
    ServEventChannel.prototype.detachMessageChannel = function () {
        this.recvable = false;
        window.removeEventListener(this.recvStringMark, this.onEventMessage);
    };
    ServEventChannel.prototype.sendChannelPackage = function (pkg) {
        var _this = this;
        this.asyncDispatchPromise.then(function () {
            var event = new CustomEvent(_this.sendStringMark, { detail: pkg });
            window.dispatchEvent(event);
        });
        return true;
    };
    return ServEventChannel;
}(ServChannel_1.ServChannel));
exports.ServEventChannel = ServEventChannel;
//# sourceMappingURL=ServEventChannel.js.map