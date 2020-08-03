"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServEventerManager = void 0;
var eventemitter3_1 = require("eventemitter3");
var DUMMY_UNLISTENER = function () { return undefined; };
var Eventer = /** @class */ (function () {
    function Eventer(service, event) {
        this.service = service;
        this.event = event;
        this.rawEvent = Eventer.generateRawEvent(service, event);
    }
    Eventer.generateRawEvent = function (service, event) {
        return "SERVKIT#" + service + "#" + event;
    };
    Eventer.prototype.on = function (listener) {
        var unlistener = this.generateUnlitener(listener);
        if (this.center) {
            this.center.on(this.rawEvent, listener);
        }
        return unlistener;
    };
    Eventer.prototype.once = function (listener) {
        var old = listener;
        var unlistener = undefined;
        listener = function () {
            old.apply(this, arguments);
            if (unlistener) {
                unlistener();
            }
        };
        unlistener = this.generateUnlitener(listener);
        if (this.center) {
            this.center.once(this.rawEvent, listener);
        }
        return unlistener;
    };
    Eventer.prototype.emit = function (args) {
        if (!this.center) {
            return Promise.reject(new Error('unknown'));
        }
        return Promise.resolve(this.center.emit(this.rawEvent, this, args));
    };
    Eventer.prototype.attach = function (center) {
        if (this.center !== center) {
            this.detach();
            this.center = center;
        }
    };
    Eventer.prototype.detach = function () {
        if (this._unlisteners) {
            this._unlisteners.forEach(function (item) {
                item();
            });
            this._unlisteners = undefined;
        }
        this.center = undefined;
    };
    Eventer.prototype.generateUnlitener = function (listener) {
        var _this = this;
        var unlistener = DUMMY_UNLISTENER;
        if (this.center) {
            unlistener = function () {
                if (_this._unlisteners) {
                    var i = _this._unlisteners.indexOf(unlistener);
                    if (i >= 0) {
                        _this._unlisteners.splice(i, 1);
                    }
                }
                if (_this.center) {
                    _this.center.off(_this.rawEvent, listener);
                }
            };
            this.unlisteners.push(unlistener);
        }
        return unlistener;
    };
    Object.defineProperty(Eventer.prototype, "unlisteners", {
        get: function () {
            if (!this._unlisteners) {
                this._unlisteners = [];
            }
            return this._unlisteners;
        },
        enumerable: false,
        configurable: true
    });
    return Eventer;
}());
var ServEventerManager = /** @class */ (function () {
    function ServEventerManager() {
    }
    ServEventerManager.prototype.init = function (onEmit) {
        this.eventers = [];
        this.onEmit = onEmit;
        this.initCenter();
    };
    ServEventerManager.prototype.release = function () {
        this.eventers.forEach(function (item) {
            item.detach();
        });
        this.releaseCenter();
        this.onEmit = undefined;
    };
    ServEventerManager.prototype.spawn = function (service, event) {
        var eventer = new Eventer(service, event);
        eventer.attach(this.center);
        this.eventers.push(eventer);
        return eventer;
    };
    ServEventerManager.prototype.rawEmit = function (service, event, args) {
        try {
            if (this.center && this.oldEmit) {
                return this.oldEmit.call(this.center, Eventer.generateRawEvent(service, event), args);
            }
        }
        catch (e) {
            //
        }
    };
    ServEventerManager.prototype.initCenter = function () {
        this.center = new eventemitter3_1.EventEmitter();
        // Inject center
        this.oldEmit = this.center.emit;
        var self = this;
        this.center.emit = function (event, eventer, args) {
            var ret = false;
            try {
                if (self.oldEmit) {
                    ret = self.oldEmit.call(this, event, args);
                }
            }
            catch (e) {
                //
            }
            if (self.onEmit) {
                return self.onEmit(eventer, args);
            }
            return ret;
        };
    };
    ServEventerManager.prototype.releaseCenter = function () {
        this.center = undefined;
        this.oldEmit = undefined;
    };
    return ServEventerManager;
}());
exports.ServEventerManager = ServEventerManager;
//# sourceMappingURL=ServEventerManager.js.map