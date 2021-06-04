/**
 * create promise defer
 */
export function defer<T = void>() {
    let resolve: ((value?: T | PromiseLike<T>) => void) | undefined;
    let reject: ((reason?: any) => void) | undefined;
    const promise = new Promise<T>((r, j) => {
        resolve = r;
        reject = j;
    });

    return {
        promise,
        resolve: resolve!,
        reject: reject!,
    };
}
