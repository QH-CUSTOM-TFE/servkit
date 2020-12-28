import { Servkit } from '../servkit/Servkit';
export declare function getParamsPool(servkit: Servkit, create?: boolean): {
    [key: string]: any;
};
export declare function delParamsPool(servkit: Servkit, create?: boolean): void;
export declare function putSharedParams(servkit: Servkit, key: string, params: any): void;
export declare function getSharedParams(servkit: Servkit, key: string): any;
export declare function delSharedParams(servkit: Servkit, key: string): void;
export declare function popSharedParams(servkit: Servkit, key: string): any;
