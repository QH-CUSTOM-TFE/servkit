"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setServConstant = exports.EServConstant = exports.createDeferred = exports.parseQueryParams = exports.generateQueryParams = exports.setEnv = exports.logACL = exports.logSession = exports.noop = exports.asyncThrowMessage = exports.asyncThrow = exports.Env = void 0;
exports.Env = {
    DEV: false,
    JEST: false,
};
try {
    var LOCAL_ENV_1 = '__$$servkit';
    var __$$servkit_1 = {
        getLocalEnv: function (key) {
            try {
                var jsonData = window.localStorage.getItem(LOCAL_ENV_1);
                var data = jsonData ? JSON.parse(jsonData) : {};
                return key ? data[key] : data;
            }
            catch (e) {
                //
            }
        },
        setLocalEnv: function (key, val) {
            if (val === void 0) { val = true; }
            try {
                var data = __$$servkit_1.getLocalEnv();
                data[key] = val;
                window.localStorage.setItem(LOCAL_ENV_1, JSON.stringify(data));
                return data;
            }
            catch (e) {
                //
            }
        },
        enableDev: function () {
            __$$servkit_1.setLocalEnv('DEV');
        },
        disableDev: function () {
            __$$servkit_1.setLocalEnv('DEV', false);
        },
        Env: exports.Env,
    };
    var localEnv = __$$servkit_1.getLocalEnv();
    Object.assign(exports.Env, localEnv);
    window.__$$servkit = __$$servkit_1;
}
catch (e) {
    //
}
function asyncThrow(error) {
    if (!exports.Env.JEST) {
        setTimeout(function () {
            throw error;
        });
    }
}
exports.asyncThrow = asyncThrow;
function asyncThrowMessage(msg) {
    msg = "[SERVKIT] " + msg;
    asyncThrow(new Error(msg));
}
exports.asyncThrowMessage = asyncThrowMessage;
function noop() {
    //
}
exports.noop = noop;
function logSessionImpl(session) {
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
}
function logServerACLImpl(server) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var tag = "[SERVKIT][" + server.terminal.id + "][" + (server.terminal.isMaster() ? 'M' : 'S') + "] ";
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
}
exports.logSession = exports.Env.DEV ? logSessionImpl : noop;
exports.logACL = exports.Env.DEV ? logServerACLImpl : noop;
exports.setEnv = function (env) {
    Object.assign(exports.Env, env);
    exports.logSession = exports.Env.DEV ? logSessionImpl : noop;
    exports.logACL = exports.Env.DEV ? logServerACLImpl : noop;
};
var QUERY_PARAMS_KEY = '__SERVKIT_QUERY_PARAMS__';
function generateQueryParams(params) {
    if (params === undefined) {
        return '';
    }
    try {
        var query = encodeURIComponent(JSON.stringify(params));
        return QUERY_PARAMS_KEY + "=" + query;
    }
    catch (e) {
        asyncThrow(e);
    }
    return '';
}
exports.generateQueryParams = generateQueryParams;
function parseQueryParams() {
    var ret;
    try {
        var query = window.location.search;
        if (!query || query.indexOf(QUERY_PARAMS_KEY) < 0) {
            return;
        }
        query = query.substr(1);
        query.split("&").some(function (t) {
            if (!t) {
                return false;
            }
            var n = t.split("=");
            if (!n || n.length !== 2) {
                return false;
            }
            if (n[0] !== QUERY_PARAMS_KEY) {
                return false;
            }
            ret = JSON.parse(decodeURIComponent(n[1]));
            return true;
        });
    }
    catch (e) {
        asyncThrow(e);
        ret = undefined;
    }
    return ret;
}
exports.parseQueryParams = parseQueryParams;
function createDeferred() {
    var reject = undefined;
    var resolve = undefined;
    var promise = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
}
exports.createDeferred = createDeferred;
//////////////////////////////////////
// Constant
exports.EServConstant = {
    SERV_COMMON_RETURN_TIMEOUT: 15000,
    SERV_API_TIMEOUT: 30000,
    SERV_SESSION_OPEN_TIMEOUT: 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: 30000,
};
function setServConstant(constans) {
    Object.assign(exports.EServConstant, constans);
}
exports.setServConstant = setServConstant;
//# sourceMappingURL=index.js.map