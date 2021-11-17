/* eslint-disable @typescript-eslint/ban-types */

import { Constructor } from "./types";

export function getAllPrototypes<T>(Service: Constructor<T>): Function[] {
    const all: Function[] = [Service];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = Object.getPrototypeOf(Service);
    while (obj && typeof obj === "function" && obj.prototype) {
        all.push(obj);
        obj = Object.getPrototypeOf(obj);
    }

    return all;
}

export function executeArrayMaybePromise(
    array: (() => Promise<unknown> | unknown)[],
    toReturn: unknown[] = []
): Promise<unknown[]> | unknown[] {
    while (array.length) {
        // smh eslint this is safe
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const func = array.shift()!;
        const val = func();
        if (val instanceof Promise) {
            return val.then((newVal) => {
                toReturn.push(newVal);
                return executeArrayMaybePromise(array, toReturn);
            });
        } else {
            toReturn.push(val);
        }
    }

    return toReturn;
}
