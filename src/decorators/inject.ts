import {INJECT_KEY} from "../injector";
import {Container} from "../container";
import {FieldProvider, Provider} from "../types";

export interface InjectProps {
    provider?: FieldProvider;
}

export const Inject = (props?: InjectProps | Provider) => (target: Object, propertyName: string) => {
    const metadata = Reflect.getMetadata("design:type", target, propertyName);

    if (typeof props === "function") {
        props = {
            provider: props,
        };
    }

    const retrievalProvider = props?.provider || ((container: Container) => {
        return container.getMaybePromise(metadata);
    });

    let val: any = undefined;
    const provider: Provider = (container: Container, target: Object) => {
        const retrieved = retrievalProvider(container, target, propertyName);
        if (retrieved instanceof Promise) {
            return retrieved.then(newVal => val = newVal);
        } else {
            val = retrieved;
        }
    };

    const data: InjectProps[] = Reflect.getMetadata(INJECT_KEY, target) || [];
    data.push({
        provider,
    });
    Reflect.defineMetadata(INJECT_KEY, data, target);

    Object.defineProperty(target, propertyName, {
        get() {
            if (val === undefined) {
                throw new Error(`Property ${propertyName} has not been injected`);
            }
            return val;
        },

        set() {
            throw new Error("Cannot modify injected value");
        }
    });
};
