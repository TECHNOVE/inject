import "reflect-metadata";

import {Constructor, Provider} from "./types";
import {INJECT_KEY, InjectedData} from "./injector";
import {SERVICE_KEY, ServiceProps} from "./decorators/service";
import {Key} from "./key";

export class Container {
    private readonly storage = new Map<any, any>();

    public constructor() {
        // public constructor
    }

    public get<T>(Service: Constructor<T>) {
        const val = this.getMaybePromise(Service);
        if (val instanceof Promise) {
            throw new Error(`Tried to resolve async service with get(${Service.name}), please use load(${Service.name}) instead`);
        }
        return val;
    }

    public register<T>(Service: Constructor<T>, instance: T) {
        const all: Function[] = [Service];

        let obj: any = Object.getPrototypeOf(Service);
        while (obj && typeof obj === "function" && obj.prototype) {
            all.push(obj);
            obj = Object.getPrototypeOf(obj);
        }

        for (const func of all) {
            if (this.storage.has(func)) {
                throw new Error(`When registering ${Service.name} found existing ${func.name} registered`);
            }
        }

        for (const func of all) {
            this.storage.set(func, instance);
        }
    }

    public load<T>(Service: Constructor<T>): Promise<T> {
        return Promise.resolve(this.getMaybePromise(Service));
    }

    // This function is not intended to be used directly, use get(Service) instead
    public getMaybePromise<T>(Service: Constructor<T>): T | Promise<T> {
        if (this.storage.has(Service)) {
            return this.storage.get(Service);
        }

        const all: Function[] = [Service];

        let obj: any = Object.getPrototypeOf(Service);
        while (obj && typeof obj === "function" && obj.prototype) {
            all.push(obj);
            obj = Object.getPrototypeOf(obj);
        }

        for (const func of all) {
            if (this.storage.has(func)) {
                throw new Error(`When registering ${Service.name} found existing ${func.name} registered`);
            }
        }

        const serviceProps: ServiceProps = Reflect.getMetadata(SERVICE_KEY, Service) || {};
        const injectData: InjectedData[] = Reflect.getMetadata(INJECT_KEY, Service.prototype) || [];

        const service = new (Service as any)();

        for (const func of all) {
            this.storage.set(func, service);
        }

        let anyPromises = false;
        const mapped = injectData.map(({provider}: {provider: Provider}) => {
            const val = provider(this, service);
            anyPromises ||= val instanceof Promise;
            return val;
        });

        if (!anyPromises) {
            return service;
        }

        return Promise.all(mapped).then(() => service);
    }

    public getValue<T>(key: Key<T>): T | undefined {
        return this.storage.get(key);
    }

    public setValue<T>(key: Key<T>, value: T) {
        this.storage.set(key, value);
    }

    public removeValue<T>(key: Key<T>): T | undefined {
        const val = this.storage.get(key);
        this.storage.delete(key);
        return val;
    }
}

export const globalContainer = new Container();

export function get<T>(Service: Constructor<T>): T {
    return globalContainer.get(Service);
}

export function load<T>(Service: Constructor<T>): Promise<T> {
    return globalContainer.load(Service);
}

export function register<T>(Service: Constructor<T>, instance: T) {
    globalContainer.register(Service, instance);
}

export function getValue<T>(key: Key<T>): T | undefined {
    return globalContainer.getValue(key);
}

export function setValue<T>(key: Key<T>, value: T) {
    globalContainer.setValue(key, value);
}

export function removeValue<T>(key: Key<T>): T | undefined {
    return globalContainer.removeValue(key);
}
