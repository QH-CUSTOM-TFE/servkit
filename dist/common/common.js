"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeExec = exports.nextUUID = exports.asyncThrowMessage = exports.asyncThrow = exports.noop = exports.setEnv = exports.logACL = exports.logSession = exports.setServConstant = exports.EServConstant = exports.Env = void 0;
exports.Env = {
    DEV: false,
    JEST: false,
    SAPPSDK_MOCK: false,
};
try {
    if (window.__$$servkit) {
        // tslint:disable-next-line:no-console
        console.warn('\n\nSERVKIT WARNING!\n\nYOU HAVE MULTIPLE VERSIONS OF SERVKIT INSTALLED IN YOUR PROJECT!\n');
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
        enableSappSDKMock: function () {
            __$$servkit_1.setLocalEnv('SAPPSDK_MOCK');
        },
        disableSappSDKMock: function () {
            __$$servkit_1.setLocalEnv('SAPPSDK_MOCK', false);
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
exports.EServConstant = {
    SERV_SAPP_ON_START_TIMEOUT: 30000,
    SERV_COMMON_RETURN_TIMEOUT: 30000,
    SERV_API_TIMEOUT: 30000,
    SERV_SESSION_OPEN_TIMEOUT: 30000,
    SERV_SESSION_CALL_MESSAGE_TIMEOUT: 30000,
    SAPP_HIDE_MAX_TIME: 600000,
    SAPP_LIFECYCLE_TIMEOUT: 120000,
};
function setServConstant(constans) {
    Object.assign(exports.EServConstant, constans);
}
exports.setServConstant = setServConstant;
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
function noop() {
    //
}
exports.noop = noop;
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
var nextId = 0;
var startTimestamp = Date.now();
function nextUUID() {
    ++nextId;
    return startTimestamp + "-" + Date.now() + "-" + nextId;
}
exports.nextUUID = nextUUID;
function safeExec(func) {
    try {
        return func();
    }
    catch (e) {
        asyncThrow(e);
    }
    return undefined;
}
exports.safeExec = safeExec;
//# sourceMappingURL=common.js.map