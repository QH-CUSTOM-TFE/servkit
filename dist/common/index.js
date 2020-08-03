"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSession = exports.noop = exports.asyncThrowMessage = exports.asyncThrow = exports.EServConstant = exports.Env = void 0;
exports.Env = {
    DEV: false,
};
try {
    var jsonData = window.localStorage.getItem('__servkit.config__');
    var config = jsonData ? JSON.parse(jsonData) : {};
    Object.assign(exports.Env, config);
}
catch (e) {
    //
}
var EServConstant;
(function (EServConstant) {
    EServConstant[EServConstant["SERV_API_TIMEOUT"] = 30000] = "SERV_API_TIMEOUT";
    EServConstant[EServConstant["SERV_SESSION_OPEN_TIMEOUT"] = 30000] = "SERV_SESSION_OPEN_TIMEOUT";
    EServConstant[EServConstant["SERV_SESSION_CALL_MESSAGE_TIMEOUT"] = 30000] = "SERV_SESSION_CALL_MESSAGE_TIMEOUT";
})(EServConstant = exports.EServConstant || (exports.EServConstant = {}));
exports.asyncThrow = function (error) {
    setTimeout(function () {
        throw error;
    });
};
exports.asyncThrowMessage = function (msg) {
    msg = "[SERVKIT] " + msg;
    exports.asyncThrow(new Error(msg));
};
exports.noop = function () { return ({}); };
exports.logSession = exports.Env.DEV ? function (session) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var tag = "[SERVKIT][" + session.getID() + "][" + (session.isMaster() ? 'M' : 'S') + "] ";
    var arg0 = args[0];
    if (typeof arg0 === 'string') {
        arg0 = tag + arg0;
        args[0] = arg0;
    }
    else {
        args.unshift(tag);
    }
    // tslint:disable-next-line:no-console
    console.log.apply(console, args);
} : exports.noop;
//# sourceMappingURL=index.js.map