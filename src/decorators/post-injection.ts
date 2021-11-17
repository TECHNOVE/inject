import { getInjectedData, InjectedData } from "../injector";

export const PostInjection: () => MethodDecorator =
    () => (target, propertyKey) => {
        if (typeof propertyKey !== "string") {
            throw new Error("Only accepts string keys");
        }

        const data: InjectedData = getInjectedData(target);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const func = (target as any)[propertyKey];

        if (typeof func !== "function") {
            throw new Error("Expected function");
        }

        if (func.length !== 0 && func.length !== 1) {
            throw new Error("Expected function to have 0-1 parameters");
        }

        data.postInjection.push(func);
    };
