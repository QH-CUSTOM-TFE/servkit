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
exports.SappACLResolver = void 0;
var ServServiceServerACLResolver_1 = require("../service/ServServiceServerACLResolver");
var SappACLResolver = /** @class */ (function (_super) {
    __extends(SappACLResolver, _super);
    function SappACLResolver(app) {
        var _this = _super.call(this) || this;
        _this.app = app;
        return _this;
    }
    SappACLResolver.prototype.init = function () {
        return Promise.resolve();
    };
    return SappACLResolver;
}(ServServiceServerACLResolver_1.ServServiceServerACLResolver));
exports.SappACLResolver = SappACLResolver;
//# sourceMappingURL=SappACLResolver.js.map