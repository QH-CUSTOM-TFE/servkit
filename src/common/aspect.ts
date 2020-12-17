import { asyncThrow } from './common';

export function aspect<O = any>(obj: O, fn: string, beforeImpl?: () => void, afterImpl?: (result?: any) => any) {
    const oldFn = (obj as any)[fn];
    const newFn = function() {
        // Do before aspect
        if (beforeImpl) {
            try {
                beforeImpl.call(this);
            } catch (e) {
                asyncThrow(e);
            }
        }
        
        const ret = oldFn.apply(this, arguments);

        // Do after aspect
        if (afterImpl) {
            try {
                afterImpl.call(this, ret);
            } catch (e) {
                asyncThrow(e);
            }
        }
        
        return ret;
    };
    (obj as any)[fn] = newFn;
    (newFn as any).__aopOld = oldFn;
}

export function aspectBefore<O = any>(obj: O, fn: string, impl: () => void) {
    aspect(obj, fn, impl, undefined);
}

export function aspectAfter<O = any>(obj: O, fn: string, impl: (result: any) => any) {
    aspect(obj, fn, undefined, impl);
}
