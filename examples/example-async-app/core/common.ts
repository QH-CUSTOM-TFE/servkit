import { SappAsyncLoadSDK } from 'servkit';

export let sappSDK: SappAsyncLoadSDK;

export function setSDK(sdk: SappAsyncLoadSDK) {
    sappSDK = sdk;
}

export function unSetSDK() {
    sappSDK = undefined!;
}
