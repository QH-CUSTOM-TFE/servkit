export declare function aspect<O = any>(obj: O, fn: string, beforeImpl?: () => void, afterImpl?: (result?: any) => any): void;
export declare function aspectBefore<O = any>(obj: O, fn: string, impl: () => void): void;
export declare function aspectAfter<O = any>(obj: O, fn: string, impl: (result: any) => any): void;
