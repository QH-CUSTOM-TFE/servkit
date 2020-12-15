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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SappLifecycle = void 0;
var ServService_1 = require("../../../service/ServService");
var SappLifecycle = /** @class */ (function (_super) {
    __extends(SappLifecycle, _super);
    function SappLifecycle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SappLifecycle.prototype.auth = function (params) {
        return ServService_1.API_UNSUPPORT();
    };
    SappLifecycle.prototype.onStart = function () {
        return ServService_1.API_UNSUPPORT();
    };
    SappLifecycle.prototype.getStartData = function () {
        return ServService_1.API_UNSUPPORT();
    };
    SappLifecycle.prototype.show = function (params) {
        return ServService_1.API_UNSUPPORT();
    };
    SappLifecycle.prototype.hide = function (params) {
        return ServService_1.API_UNSUPPORT();
    };
    SappLifecycle.prototype.close = function (result) {
        return ServService_1.API_UNSUPPORT();
    };
    __decorate([
        ServService_1.anno.decl.api()
    ], SappLifecycle.prototype, "auth", null);
    __decorate([
        ServService_1.anno.decl.api()
    ], SappLifecycle.prototype, "onStart", null);
    __decorate([
        ServService_1.anno.decl.api()
    ], SappLifecycle.prototype, "getStartData", null);
    __decorate([
        ServService_1.anno.decl.api()
    ], SappLifecycle.prototype, "show", null);
    __decorate([
        ServService_1.anno.decl.api()
    ], SappLifecycle.prototype, "hide", null);
    __decorate([
        ServService_1.anno.decl.api()
    ], SappLifecycle.prototype, "close", null);
    SappLifecycle = __decorate([
        ServService_1.anno.decl({
            id: '$service.sapp.m.lifecycle',
            version: '1.0.0',
        })
    ], SappLifecycle);
    return SappLifecycle;
}(ServService_1.ServService));
exports.SappLifecycle = SappLifecycle;
//# sourceMappingURL=SappLifecycle.js.map