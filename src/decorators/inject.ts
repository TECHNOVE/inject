import { INJECT_KEY } from "../injector";
import { Container } from "../container";
import { FieldProvider, Provider } from "../types";

export interface InjectProps {
    provider?: FieldProvider;
}

export const Inject: (
    props?: InjectProps | FieldProvider
) => PropertyDecorator =
    (props?: InjectProps | FieldProvider) =>
    // unfortunately need to disable, since this is the actual TS type
    // eslint-disable-next-line @typescript-eslint/ban-types
    (target: Object, propertyName: string | symbol) => {
        if (typeof propertyName === "symbol") {
            throw new Error(
                "Inject decorator can only be used on class properties"
            );
        }

        const metadata = Reflect.getMetadata(
            "design:type",
            target,
            propertyName
        );

        if (typeof props === "function") {
            props = {
                provider: props,
            };
        }

        const retrievalProvider =
            props?.provider ||
            ((container: Container) => {
                return container.getMaybePromise(metadata);
            });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let val: any = undefined;
        // eslint-disable-next-line @typescript-eslint/ban-types
        const provider: Provider = (container: Container, target: Object) => {
            const retrieved = retrievalProvider(
                container,
                target,
                propertyName,
                metadata
            );
            if (retrieved instanceof Promise) {
                return retrieved.then((newVal) => (val = newVal));
            } else {
                val = retrieved;
            }
        };

        const data: InjectProps[] =
            Reflect.getMetadata(INJECT_KEY, target) || [];
        data.push({
            provider,
        });
        Reflect.defineMetadata(INJECT_KEY, data, target);

        Object.defineProperty(target, propertyName, {
            get() {
                if (val === undefined) {
                    throw new Error(
                        `Property ${propertyName} has not been injected`
                    );
                }
                return val;
            },

            set(newVal: never) {
                val = newVal;
            },
        });
    };
