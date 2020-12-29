import { asyncThrow } from './common';

const QUERY_PARAMS_KEY = '__SERVKIT_QUERY_PARAMS__';

export function wrapServQueryParams(url: string, params: any) {
    const query = generateServQueryParams(params);
    if (url.indexOf('?') >= 0) {
        url += '&' + query;
    } else {
        url += '?' + query;
    }

    return url;
}

export function generateServQueryParams(params: any) {
    if (params === undefined) {
        return '';
    }

    try {
        const query = encodeURIComponent(JSON.stringify(params));
        return `${QUERY_PARAMS_KEY}=${query}`;
    } catch (e) {
        asyncThrow(e);
    }

    return '';
}

export function parseServQueryParams() {
    let ret: any;
    try {
        let query = window.location.search;
        if (!query || query.indexOf(QUERY_PARAMS_KEY) < 0) {
            return;
        }

        query = query.substr(1);

        query.split("&").some((t) => {
            if (!t) {
                return false;
            }

            const n = t.split("=");
            if (!n || n.length !== 2) {
                return false;
            }

            if (n[0] !== QUERY_PARAMS_KEY) {
                return false;
            }

            ret = JSON.parse(decodeURIComponent(n[1]));
            return true;
        });
    } catch (e) {
        asyncThrow(e);
        ret = undefined;
    }
    return ret;
}

export function replacePlaceholders(url: string, params: { [key: string]: string }) {
    Object.keys(params).forEach((key) => {
        const val = params[key];
        url = url.replace(new RegExp(`\\$\\{${key}\\}`, 'g') , val);
    });

    return url;
}
