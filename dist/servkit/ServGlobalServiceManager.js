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
exports.ServGlobalServiceManager = void 0;
var ServServiceManager_1 = require("../service/ServServiceManager");
var ServGlobalServiceManager = /** @class */ (function (_super) {
    __extends(ServGlobalServiceManager, _super);
    function ServGlobalServiceManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServGlobalServiceManager.prototype.init = function (config) {
        _super.prototype.init.call(this, config);
    };
    return ServGlobalServiceManager;
}(ServServiceManager_1.ServServiceManager));
exports.ServGlobalServiceManager = ServGlobalServiceManager;
//# sourceMappingURL=ServGlobalServiceManager.js.map