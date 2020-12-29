import { Servkit } from '../servkit/Servkit';
export declare function getParamsPool(servkit: Servkit, create?: boolean): {
    [key: string]: any;
};
export declare function delParamsPool(servkit: Servkit, create?: boolean): void;
export declare function putSharedParams(servkit: Servkit, key: string, params: any): void;
export declare function getSharedParams<T = any>(servkit: Servkit, key: string): T | undefined;
export declare function delSharedParams(servkit: Servkit, key: string): void;
export declare function popSharedParams<T = any>(servkit: Servkit, key: string): T | undefined;
