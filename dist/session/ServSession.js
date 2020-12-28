"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServSession = exports.EServSessionStatus = void 0;
var common_1 = require("../common/common");
var creator_1 = require("../message/creator");
var ServMessageContextManager_1 = require("../message/ServMessageContextManager");
var type_1 = require("../message/type");
var ServChannel_1 = require("./channel/ServChannel");
var ServEventChannel_1 = require("./channel/ServEventChannel");
var ServMessageChannel_1 = require("./channel/ServMessageChannel");
var ServWindowChannel_1 = require("./channel/ServWindowChannel");
var ServSessionChecker_1 = require("./ServSessionChecker");
var ServEventLoaderChannel_1 = require("./channel/ServEventLoaderChannel");
var Deferred_1 = require("../common/Deferred");
var EServSessionStatus;
(function (EServSessionStatus) {
    EServSessionStatus[EServSessionStatus["CLOSED"] = 0] = "CLOSED";
    EServSessionStatus[EServSessionStatus["OPENNING"] = 1] = "OPENNING";
    EServSessionStatus[EServSessionStatus["OPENED"] = 2] = "OPENED";
})(EServSessionStatus = exports.EServSessionStatus || (exports.EServSessionStatus = {}));
var ServSession = /** @class */ (function () {
    function ServSession(terminal) {
        this.terminal = terminal;
        this.pendingQueue = [];
    }
    ServSession.prototype.init = function (config) {
        this.status = EServSessionStatus.CLOSED;
        this.onRecvListeners = [];
        this.onRecvCallListeners = [];
        this.initChannel(config.channel);
        this.messageContextManager = new ServMessageContextManager_1.ServMessageContextManager();
        this.messageContextManager.init();
        if (config.checkSession) {
            var options = config.checkOptions || {};
            this.sessionCheckOptions = options;
            this.sessionChecker = new ServSessionChecker_1.ServSessionChecker(this);
            if (!options.onBroken) {
                options.onBroken = function (session) {
                    session.close();
                };
            }
        }
    };
    ServSession.prototype.release = function () {
        this.close();
        this.messageContextManager.release();
        this.releaseChannel();
        this.onRecvListeners = [];
        this.onRecvCallListeners = [];
    };
    ServSession.prototype.initChannel = function (config) {
        var _a;
        var type2cls = (_a = {},
            _a[ServChannel_1.EServChannel.WINDOW] = ServWindowChannel_1.ServWindowChannel,
            _a[ServChannel_1.EServChannel.EVENT] = ServEventChannel_1.ServEventChannel,
            _a[ServChannel_1.EServChannel.MESSAGE] = ServMessageChannel_1.ServMessageChannel,
            _a[ServChannel_1.EServChannel.EVENT_LOADER] = ServEventLoaderChannel_1.ServEventLoaderChannel,
            _a);
        var cls = typeof config.type === 'function' ? config.type : type2cls[config.type];
        if (!cls) {
            throw new Error('[SERVKIT] Unknown channel type');
        }
        this.channel = new cls();
        this.channel.init(this, config.config);
    };
    ServSession.prototype.releaseChannel = function () {
        this.channel.release();
    };
    ServSession.prototype.isMaster = function () {
        return this.terminal.isMaster();
    };
    ServSession.prototype.getID = function () {
        return this.terminal.servkit.namespace
            ? this.terminal.servkit.namespace + '-' + this.terminal.id
            : this.terminal.id;
    };
    ServSession.prototype.isOpened = function () {
        return this.status === EServSessionStatus.OPENED;
    };
    ServSession.prototype.open = function (options) {
        var _this = this;
        if (this.status > EServSessionStatus.CLOSED) {
            common_1.logSession(this, 'OPEN WHILE ' + (this.status === EServSessionStatus.OPENNING ? 'OPENNING' : 'OPENED'));
            return this.openningPromise || Promise.reject(new Error('unknown'));
        }
        this.status = EServSessionStatus.OPENNING;
        common_1.logSession(this, 'OPENNING');
        var done = false;
        var timer = 0;
        var doSafeWork = function (work) {
            if (done) {
                return;
            }
            done = true;
            _this.openningCancel = undefined;
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
            work();
        };
        var p = this.channel.open().then(function () {
            doSafeWork(function () {
                common_1.logSession(_this, 'OPENNED');
                _this.status = EServSessionStatus.OPENED;
            });
        }, function (e) {
            doSafeWork(function () {
                common_1.logSession(_this, 'OPENNING FAILED', e);
                _this.status = EServSessionStatus.CLOSED;
            });
            return Promise.reject(e);
        });
        var timeout = (options && options.timeout) || common_1.EServConstant.SERV_SESSION_OPEN_TIMEOUT;
        var pTimeout = new Promise(function (resolve, reject) {
            timer = setTimeout(function () {
                doSafeWork(function () {
                    common_1.logSession(_this, 'OPENNING TIMEOUT');
                    reject(new Error('timeout'));
                    _this.close();
                });
            }, timeout);
        });
        var pCancel = new Promise(function (resolve, reject) {
            _this.openningCancel = function () {
                doSafeWork(function () {
                    common_1.logSession(_this, 'OPENNING CANCELLED');
                    reject(new Error('cancel'));
                    _this.close();
                });
            };
        });
        this.openningPromise = Promise.race([p, pTimeout, pCancel]);
        if (this.sessionChecker) {
            this.sessionChecker.start(this.sessionCheckOptions);
        }
        return this.openningPromise.then(function () {
            _this.flushPendingQueue();
            if (_this.sessionChecker) {
                _this.sessionChecker.startChecking();
            }
        });
    };
    ServSession.prototype.close = function () {
        if (this.status <= EServSessionStatus.CLOSED) {
            common_1.logSession(this, 'CLOSE WHILE CLOSED');
            return;
        }
        this.channel.close();
        common_1.logSession(this, 'CLOSED');
        this.status = EServSessionStatus.CLOSED;
        this.flushPendingQueue();
        this.openningPromise = undefined;
        if (this.openningCancel) {
            this.openningCancel();
        }
        if (this.sessionChecker) {
            this.sessionChecker.stop();
        }
    };
    ServSession.prototype.sendMessage = function (msg) {
        if (this.status !== EServSessionStatus.OPENED) {
            if (this.status === EServSessionStatus.OPENNING) {
                var pending_1 = {
                    isSend: true,
                    message: msg,
                    sendDeferred: Deferred_1.DeferredUtil.create(),
                };
                this.pendingQueue.push(pending_1);
                return pending_1.sendDeferred;
            }
            common_1.logSession(this, 'Send(NOOPEN)', msg);
            return Promise.reject(new Error('Session not opened'));
        }
        if (msg.$type !== type_1.EServMessage.SESSION_HEARTBREAK) {
            common_1.logSession(this, 'Send', msg);
        }
        // const pkg: ServSessionPackage = {
        //     $msg: msg,
        //     $sid: this.id,
        //     $stp: this.type,
        // };
        var ret = this.channel.send(msg);
        if (!ret) {
            return Promise.reject(new Error('Send failed'));
        }
        return Promise.resolve();
    };
    ServSession.prototype.callMessage = function (type, args, options) {
        var message = creator_1.ServSessionCallMessageCreator.create(type, args);
        var timeout = undefined;
        if (options && options.timeout !== undefined) {
            timeout = options.timeout;
        }
        else {
            timeout = common_1.EServConstant.SERV_SESSION_CALL_MESSAGE_TIMEOUT;
        }
        var addOptions = {
            timeout: timeout,
            prewait: this.sendMessage(message),
        };
        var promise = this.messageContextManager.add(message, addOptions);
        if (!promise) {
            promise = this.messageContextManager.getPromise(message.$id);
        }
        if (!promise) {
            promise = Promise.reject(new Error('unknown'));
        }
        return promise;
    };
    ServSession.prototype.handleReturnMessage = function (message) {
        if (message.error) {
            return this.messageContextManager.failed(message.$id, message.error);
        }
        else {
            return this.messageContextManager.succeed(message.$id, message.data);
        }
    };
    ServSession.prototype.recvPackage = function (pkg) {
        if (this.status !== EServSessionStatus.OPENED) {
            if (this.status === EServSessionStatus.OPENNING) {
                var pending_2 = {
                    message: pkg,
                };
                this.pendingQueue.push(pending_2);
                return;
            }
            common_1.logSession(this, 'Recv(NOOPEN)', pkg);
            return;
        }
        if (!pkg || typeof pkg !== 'object') {
            common_1.logSession(this, 'Recv(INVALID)', pkg);
            return;
        }
        // if (pkg.$sid !== this.id) {
        //     return;
        // }
        // if (this.type === EServSession.MASTER && pkg.$stp !== EServSession.SLAVE) {
        //     return;
        // }
        // if (this.type === EServSession.SLAVE && pkg.$stp !== EServSession.MASTER) {
        //     return;
        // }
        this.dispatchMessage(pkg);
    };
    ServSession.prototype.dispatchMessage = function (msg) {
        var _this = this;
        if (this.sessionChecker && msg.$type === type_1.EServMessage.SESSION_HEARTBREAK) {
            this.sessionChecker.handleEchoMessage(msg);
            return;
        }
        common_1.logSession(this, 'Recv', msg);
        if (creator_1.ServSessionCallMessageCreator.isCallReturnMessage(msg)) {
            this.handleReturnMessage(msg);
            return;
        }
        if (creator_1.ServSessionCallMessageCreator.isCallMessage(msg)) {
            var callMsg_1 = msg;
            var doReturn = function (data, error) {
                _this.sendMessage(creator_1.ServSessionCallMessageCreator.createReturn(callMsg_1, data, error));
            };
            if (this.onRecvCallListeners.length !== 0) {
                var callListeners = this.onRecvCallListeners;
                for (var i = 0, iz = callListeners.length; i < iz; ++i) {
                    try {
                        if (callListeners[i](callMsg_1.type, callMsg_1.args, doReturn, this, this.terminal)) {
                            return;
                        }
                    }
                    catch (e) {
                        common_1.asyncThrow(e);
                    }
                }
            }
            doReturn(undefined, "Unknow call type [" + callMsg_1.type + "]");
            return;
        }
        if (this.onRecvListeners.length !== 0) {
            var listeners = this.onRecvListeners;
            for (var i = 0, iz = listeners.length; i < iz; ++i) {
                try {
                    listeners[i](msg, this, this.terminal);
                }
                catch (e) {
                    common_1.asyncThrow(e);
                }
            }
        }
    };
    ServSession.prototype.onRecvMessage = function (listener) {
        var _this = this;
        var ret = function () {
            var i = _this.onRecvListeners.indexOf(listener);
            if (i >= 0) {
                _this.onRecvListeners.splice(i, 1);
            }
        };
        if (this.onRecvListeners.indexOf(listener) < 0) {
            this.onRecvListeners.push(listener);
        }
        return ret;
    };
    ServSession.prototype.onRecvCallMessage = function (listener) {
        var _this = this;
        var ret = function () {
            var i = _this.onRecvCallListeners.indexOf(listener);
            if (i >= 0) {
                _this.onRecvCallListeners.splice(i, 1);
            }
        };
        if (this.onRecvCallListeners.indexOf(listener) < 0) {
            this.onRecvCallListeners.push(listener);
        }
        return ret;
    };
    ServSession.prototype.flushPendingQueue = function () {
        var _this = this;
        var pendingQueue = this.pendingQueue;
        this.pendingQueue = [];
        if (this.status === EServSessionStatus.CLOSED) {
            pendingQueue.forEach(function (item) {
                if (item.isSend) {
                    item.sendDeferred.reject(new Error('Session not opened'));
                }
            });
        }
        else if (this.status === EServSessionStatus.OPENED) {
            pendingQueue.forEach(function (item) {
                if (item.isSend) {
                    _this.sendMessage(item.message).then(function (data) {
                        item.sendDeferred.resolve(data);
                    }, function (error) {
                        item.sendDeferred.reject(error);
                    });
                }
                else {
                    _this.recvPackage(item.message);
                }
            });
        }
    };
    return ServSession;
}());
exports.ServSession = ServSession;
//# sourceMappingURL=ServSession.js.map