import "reflect-metadata";

import { Constructor } from "./types";
import { getInjectedData, InjectedData } from "./injector";
import { Key } from "./key";
import { getServiceData, ServiceData } from "./service";
import { executeArrayMaybePromise, getAllPrototypes } from "./utils";

export class Container {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly storage = new Map<unknown, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly classes = new Map<unknown, any>();

    public constructor() {
        // public constructor
    }

    public get<T>(Service: Constructor<T>) {
        const val = this.getMaybePromise(Service);
        if (val instanceof Promise) {
            throw new Error(
                `Tried to resolve async service with get(${Service.name}), please use load(${Service.name}) instead`
            );
        }
        return val;
    }

    public register<T>(Service: Constructor<T>, instance?: T) {
        const serviceData: ServiceData = getServiceData(Service);

        if (!serviceData.singleton) {
            throw new Error(
                `Can only register singletons, not ${Service.name}`
            );
        }

        const all = getAllPrototypes(Service);

        for (const func of all) {
            if (this.storage.has(func)) {
                throw new Error(
                    `When registering ${Service.name} found existing ${func.name} registered`
                );
            }
        }

        if (instance) {
            for (const func of all) {
                this.storage.set(func, instance);
            }
        } else {
            for (const func of all) {
                this.classes.set(func, Service);
            }
        }
    }

    public load<T>(Service: Constructor<T>): Promise<T> {
        return Promise.resolve(this.getMaybePromise(Service));
    }

    // This function is not intended to be used directly, use get(Service) instead
    public getMaybePromise<T>(Service: Constructor<T>): T | Promise<T> {
        const serviceData: ServiceData = getServiceData(Service);

        if (this.classes.has(Service)) {
            Service = this.classes.get(Service);
        }

        if (serviceData.singleton && this.storage.has(Service)) {
            return this.storage.get(Service);
        }

        const all = getAllPrototypes(Service);

        if (serviceData.singleton) {
            for (const func of all) {
                if (this.storage.has(func)) {
                    throw new Error(
                        `When registering ${Service.name} found existing ${func.name} registered`
                    );
                }
            }
        }

        const injectData: InjectedData = getInjectedData(Service.prototype);

        if (
            injectData.parameters.length !==
            Service.prototype.constructor.length
        ) {
            throw new Error(
                `When registering ${Service.name} found ${injectData.parameters.length} parameters, but constructor has ${Service.prototype.constructor.length}`
            );
        }

        for (let i = 0; i < injectData.parameters.length; i++) {
            const provider = injectData.parameters[i];
            if (!provider) {
                throw new Error(
                    `When registering ${Service.name}, parameter ${i} was found missing a @Inject()`
                );
            }
        }

        const params = executeArrayMaybePromise(
            injectData.parameters.map((param) => () => param(this, Service))
        );

        if (params instanceof Promise) {
            return params.then((values) => create(values));
        }

        const create = (params: unknown[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const service = new (Service as any)(...params);

            if (serviceData.singleton) {
                for (const func of all) {
                    this.storage.set(func, service);
                }
            }

            const mapped = executeArrayMaybePromise(
                injectData.properties.map(
                    (provider) => () => provider(this, service)
                )
            );

            const postInitialization = () => {
                let anyPromises = false;

                const mapped = injectData.postInjection.map((func) => {
                    const val = func.call(service, this);
                    anyPromises ||= val instanceof Promise;
                    return val;
                });

                if (anyPromises) {
                    return Promise.all(mapped).then(() => service);
                }

                return service;
            };

            if (!(mapped instanceof Promise)) {
                return postInitialization();
            }

            return mapped.then(() => postInitialization());
        };

        return create(params);
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
