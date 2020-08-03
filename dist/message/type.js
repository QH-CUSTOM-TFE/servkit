"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EServServiceMessage = exports.ServMessage = exports.EServMessage = void 0;
var EServMessage;
(function (EServMessage) {
    EServMessage["SERVICE"] = "$service";
    EServMessage["SESSION_CALL"] = "$session_call";
    EServMessage["SESSION_CALL_RETURN"] = "$session_call_return";
    EServMessage["SESSION_HEARTBREAK"] = "$session_heartbreak";
})(EServMessage = exports.EServMessage || (exports.EServMessage = {}));
var ServMessage = /** @class */ (function () {
    function ServMessage() {
    }
    return ServMessage;
}());
exports.ServMessage = ServMessage;
var EServServiceMessage;
(function (EServServiceMessage) {
    EServServiceMessage[EServServiceMessage["NULL"] = 0] = "NULL";
    EServServiceMessage[EServServiceMessage["API"] = 1] = "API";
    EServServiceMessage[EServServiceMessage["API_RETURN"] = 2] = "API_RETURN";
    EServServiceMessage[EServServiceMessage["EVENT"] = 3] = "EVENT";
})(EServServiceMessage = exports.EServServiceMessage || (exports.EServServiceMessage = {}));
//# sourceMappingURL=type.js.map