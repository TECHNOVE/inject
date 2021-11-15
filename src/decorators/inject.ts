/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */

import { Container } from "../container";
import { Constructor, FieldProvider, Provider } from "../types";
import { getInjectedData, InjectedData } from "../injector";
import { FieldParameter, FieldProperty } from "../field";

export interface InjectProps {
    provider?: FieldProvider<any>;
}

export const Inject: (
    props?: InjectProps | FieldProvider<any>
) => PropertyDecorator & ParameterDecorator =
    (props?: InjectProps | FieldProvider<any>) =>
    (
        target: Object,
        propertyName: string | symbol,
        parameterIndex?: number
    ) => {
        if (typeof propertyName === "symbol") {
            throw new Error(
                "Inject decorator can only be used on class properties"
            );
        }

        let propertyType: any;

        if (parameterIndex === undefined) {
            propertyType = Reflect.getMetadata(
                "design:type",
                target,
                propertyName
            );
        } else {
            const types = Reflect.getMetadata(
                "design:paramtypes",
                target,
                propertyName
            );
            propertyType = types[parameterIndex];
        }

        if (typeof props === "function") {
            props = {
                provider: props,
            };
        }

        const retrievalProvider =
            props?.provider ||
            ((container: Container) => {
                return container.getMaybePromise(propertyType);
            });

        const data: InjectedData = getInjectedData(
            parameterIndex === undefined ? target : (target as any).prototype
        );

        if (parameterIndex === undefined) {
            const defaultValue = (target as any)[propertyName];

            let val: any = undefined;
            const provider: Provider = (
                container: Container,
                target: Object
            ) => {
                const field: FieldProperty<unknown> = {
                    fieldType: "property",
                    defaultValue,
                    target,
                    type: propertyType,
                };

                const retrieved = retrievalProvider(container, field);
                if (retrieved instanceof Promise) {
                    return retrieved.then((newVal) => (val = newVal));
                } else {
                    val = retrieved;
                }
            };
            data.properties.push(provider);

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
        } else {
            if (propertyType === target) {
                throw new Error("Cannot inject self in constructor");
            }

            data.parameters[parameterIndex] = (
                container: Container,
                target: Constructor<unknown>
            ) => {
                const field: FieldParameter<unknown> = {
                    fieldType: "parameter",
                    target,
                    type: propertyType,
                };

                return retrievalProvider(container, field);
            };
        }
    };
