"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServServiceServerACLResolver = void 0;
var ServServiceServerACLResolver = /** @class */ (function () {
    function ServServiceServerACLResolver() {
    }
    ServServiceServerACLResolver.prototype.canAccessService = function (server, service) {
        return true;
    };
    ServServiceServerACLResolver.prototype.canAccessAPI = function (server, service, api) {
        return true;
    };
    ServServiceServerACLResolver.prototype.canAccessEventer = function (server, service, event) {
        return true;
    };
    return ServServiceServerACLResolver;
}());
exports.ServServiceServerACLResolver = ServServiceServerACLResolver;
//# sourceMappingURL=ServServiceServerACLResolver.js.map