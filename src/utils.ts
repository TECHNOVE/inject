import { Constructor } from "./types";

export function getAllPrototypes<T>(Service: Constructor<T>): Function[] {
    const all: Function[] = [Service];

    let obj: any = Object.getPrototypeOf(Service);
    while (obj && typeof obj === "function" && obj.prototype) {
        all.push(obj);
        obj = Object.getPrototypeOf(obj);
    }

    return all;
}
