"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacePlaceholders = exports.parseServQueryParams = exports.generateServQueryParams = exports.wrapServQueryParams = void 0;
var common_1 = require("./common");
var QUERY_PARAMS_KEY = '__SERVKIT_QUERY_PARAMS__';
function wrapServQueryParams(url, params) {
    var query = generateServQueryParams(params);
    if (url.indexOf('?') >= 0) {
        url += '&' + query;
    }
    else {
        url += '?' + query;
    }
    return url;
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
        common_1.asyncThrow(e);
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
        common_1.asyncThrow(e);
        ret = undefined;
    }
    return ret;
}
exports.parseServQueryParams = parseServQueryParams;
function replacePlaceholders(url, params) {
    Object.keys(params).forEach(function (key) {
        var val = params[key];
        url = url.replace(new RegExp("\\$\\{" + key + "\\}", 'g'), val);
    });
    return url;
}
exports.replacePlaceholders = replacePlaceholders;
//# sourceMappingURL=query.js.map