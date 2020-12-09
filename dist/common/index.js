"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setServConstant = exports.EServConstant = exports.nextUUID = exports.aspectAfter = exports.aspectBefore = exports.aspect = exports.parseServQueryParams = exports.generateServQueryParams = exports.wrapServQueryParams = exports.setEnv = exports.logACL = exports.logSession = exports.noop = exports.asyncThrowMessage = exports.asyncThrow = exports.Env = void 0;
exports.Env = {
    DEV: false,
    JEST: false,
};
try {
    if (window.__$$servkit) {
        asyncThrowMessage("\n        NOTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n        YOU HAVE MULTIPLE VERSIONS OF SERVKIT INSTALLED IN YOUR PROJECT, AND THIS WILL PRODUCE ERROR.\n        PLEASE FIX IT.\n        ");
    }
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
    try {
        if (!(error instanceof Error)) {
            error = new Error(error && error.toString ? error.toString() : 'unknown');
        }
        if (!exports.Env.JEST) {
            setTimeout(function () {
                throw error;
            });
        }
        else {
            // tslint:disable-next-line:no-console
            console.log(error);
        }
    }
    catch (e) {
        //
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
function wrapServQueryParams(url, params) {
    var query = generateServQueryParams(params);
    if (url.indexOf('?') >= 0) {
        url += query;
    }
    else {
        url += '?' + query;
    }
    return query;
}
exports.wrapServQueryParams = wrapServQueryParams;
function generateServQueryParams(params) {
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
exports.generateServQueryParams = generateServQueryParams;
function parseServQueryParams() {
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
exports.parseServQueryParams = parseServQueryParams;
function aspect(obj, fn, beforeImpl, afterImpl) {
    var oldFn = obj[fn];
    var newFn = function () {
        // Do before aspect
        if (beforeImpl) {
            try {
                beforeImpl();
            }
            catch (e) {
                asyncThrow(e);
            }
        }
        var ret = oldFn.apply(this, arguments);
        // Do after aspect
        if (afterImpl) {
            try {
                afterImpl(ret);
            }
            catch (e) {
                asyncThrow(e);
            }
        }
        return ret;
    };
    obj[fn] = newFn;
    newFn.__aopOld = oldFn;
}
exports.aspect = aspect;
function aspectBefore(obj, fn, impl) {
    aspect(obj, fn, impl, undefined);
}
exports.aspectBefore = aspectBefore;
function aspectAfter(obj, fn, impl) {
    aspect(obj, fn, undefined, impl);
}
exports.aspectAfter = aspectAfter;
var nextId = 0;
var startTimestamp = Date.now();
function nextUUID() {
    ++nextId;
    return startTimestamp + "-" + Date.now() + "-" + nextId;
}
exports.nextUUID = nextUUID;
//////////////////////////////////////
// Constant
exports.EServConstant = {
    SERV_APP_SHOW_HIDE_TIMEOUT: 5000,
    SERV_SAPP_ON_START_TIMEOUT: 30000,
    SERV_COMMON_RETURN_TIMEOUT: 15000,
    SERV_API_TIMEOUT: 30000,
    SERV_SESSION_OPEN_TIMEOUT: 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: 30000,
    SAPP_HIDE_MAX_TIME: 36000000,
};
function setServConstant(constans) {
    Object.assign(exports.EServConstant, constans);
}
exports.setServConstant = setServConstant;
//# sourceMappingURL=index.js.map