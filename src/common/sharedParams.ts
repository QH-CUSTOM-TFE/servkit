import { Servkit } from '../servkit/Servkit';
const target = Date.prototype.getTime as any;

interface ShareParams {
    [key: string]: { [key: string]: any };
}

let sharedParams: ShareParams = target.__$servkit_sharedParams;
if (!sharedParams) {
    sharedParams = {};
    target.__$servkit_sharedParams = sharedParams;
}

const DEFAULT_SERVKIT_NAMESPACE = '__DEFAULT_SERVKIT__';

export function getParamsPool(servkit: Servkit, create?: boolean) {
    const namesapce = servkit.namespace || DEFAULT_SERVKIT_NAMESPACE;
    let pool = sharedParams[namesapce];
    if (!pool && create) {
        pool = {};
        sharedParams[namesapce] = pool;
    }

    return pool;
}

export function delParamsPool(servkit: Servkit, create?: boolean) {
    const namesapce = servkit.namespace || DEFAULT_SERVKIT_NAMESPACE;
    delete sharedParams[namesapce];
}

export function putSharedParams(servkit: Servkit, key: string, params: any) {
    const pool = getParamsPool(servkit, true);
    pool[key] = params;
}

export function getSharedParams<T = any>(servkit: Servkit, key: string): T | undefined {
    const pool = getParamsPool(servkit);
    return pool ? pool[key] : undefined;
}

export function delSharedParams(servkit: Servkit, key: string) {
    const pool = getParamsPool(servkit);
    if (pool) {
        delete pool[key];
    }
}

export function popSharedParams<T = any>(servkit: Servkit, key: string): T | undefined  {
    const params = getSharedParams(servkit, key);
    if (params !== undefined) {
        delSharedParams(servkit, key);
    }

    return params;
}
