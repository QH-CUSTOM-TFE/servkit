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
exports.ServMessageChannel = void 0;
var ServWindowChannel_1 = require("./ServWindowChannel");
var ServMessageChannel = /** @class */ (function (_super) {
    __extends(ServMessageChannel, _super);
    function ServMessageChannel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onWindowMessage = function (event) {
            if ((event.source && event.source !== _this.windowInfo.window) || !event.data) {
                return;
            }
            _this.recvChannelPackage(event.data);
        };
        return _this;
    }
    ServMessageChannel.prototype.open = function (options) {
        if (!this.session) {
            return Promise.reject(new Error('unknown'));
        }
        if (this.isOpened()) {
            return Promise.resolve();
        }
        this.windowInfo = {
            target: window,
            window: window,
            origin: '*',
        };
        this.attachMessageChannel();
        this.sendable = true;
        return Promise.resolve();
    };
    return ServMessageChannel;
}(ServWindowChannel_1.ServWindowChannel));
exports.ServMessageChannel = ServMessageChannel;
//# sourceMappingURL=ServMessageChannel.js.map