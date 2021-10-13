import { Servkit, servkit as defaultServkit } from '../servkit/Servkit';
import { SappSDKAsyncLoadStartParams, SappSDKAsyncLoadDeclContext } from '../sapp/SappSDK';
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

function getParamsPool(servkit: Servkit, create?: boolean) {
    const namesapce = servkit.namespace || DEFAULT_SERVKIT_NAMESPACE;
    let pool = sharedParams[namesapce];
    if (!pool && create) {
        pool = {};
        sharedParams[namesapce] = pool;
    }

    return pool;
}

function delParamsPool(servkit: Servkit, create?: boolean) {
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

function startParamsKey(id: string) {
    return `${id}-startParams`;
}

function declContextKey(id: string) {
    return `${id}-declContext`;
}

function globalKey(name: string, appId?: string) {
    return `${name}-${appId || ''}-global`;
}

export function putAsyncLoadStartParams(appId: string, params: SappSDKAsyncLoadStartParams) {
    return putSharedParams(defaultServkit, startParamsKey(appId), params);
}

export function getAsyncLoadStartParams(appId: string) {
    return getSharedParams<SappSDKAsyncLoadStartParams>(defaultServkit, startParamsKey(appId));
}

export function delAsyncLoadStartParams(appId: string) {
    return delSharedParams(defaultServkit, startParamsKey(appId));
}

export function putAsyncLoadDeclContext(appId: string, context: SappSDKAsyncLoadDeclContext) {
    return putSharedParams(defaultServkit, declContextKey(appId), context);
}

export function getAsyncLoadDeclContext(appId: string) {
    return getSharedParams<SappSDKAsyncLoadDeclContext>(defaultServkit, declContextKey(appId));
}

export function delAsyncLoadDeclContext(appId: string) {
    return delSharedParams(defaultServkit, declContextKey(appId));
}

/**
 * 注册全局对象，只在Async Load应用中可用
 *
 * @export
 * @param {*} val 全局对象
 * @param {string} name 全局对象名称
 * @param {string} [appId] 应用id
 * @returns
 */
export function putAsyncLoadGlobal(val: any, name: string, appId?: string) {
    return putSharedParams(defaultServkit, globalKey(name, appId), val);
}

/**
 * 获取全局对象，只在Async Load应用中可用
 *
 * @export
 * @template T
 * @param {string} name
 * @param {string} [appId]
 * @returns
 */
export function getAsyncLoadGlobal<T = any>(name: string, appId?: string) {
    return getSharedParams<T>(defaultServkit, globalKey(name, appId));
}

/**
 * 删除全局对象，只在Async Load应用中可用
 *
 * @export
 * @param {*} val
 * @param {string} name
 * @param {string} [appId]
 * @returns
 */
export function delAsyncLoadGlobal(val: any, name: string, appId?: string) {
    return delSharedParams(defaultServkit, globalKey(name, appId));
}
