/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */

import { Container } from "../container";
import { Constructor, FieldProvider, Provider } from "../types";
import { getInjectedData, InjectedData } from "../injector";
import { FieldParameter, FieldProperty } from "../field";

export interface InjectProps {
    provider?: FieldProvider<any>;
}

const NO_VALUE = Symbol("no-value");

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
            let val: any = NO_VALUE;
            const provider: Provider = (
                container: Container,
                target: Object
            ) => {
                const field: FieldProperty<unknown> = {
                    fieldType: "property",
                    name: propertyName as string,
                    defaultValue: (target as any)[propertyName],
                    target,
                    type: propertyType,
                    getValue: () => val,
                };

                Object.defineProperty(target, propertyName, {
                    get() {
                        if (val === NO_VALUE) {
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

                const retrieved = retrievalProvider(container, field);
                if (retrieved instanceof Promise) {
                    return retrieved.then((newVal) => (val = newVal));
                } else {
                    val = retrieved;
                }
            };
            data.properties.push(provider);
        } else {
            if (propertyType === target) {
                throw new Error("Cannot inject self in constructor");
            }

            data.parameters[parameterIndex] = (
                container: Container,
                target: Constructor<unknown>
            ) => {
                const field: FieldParameter = {
                    fieldType: "parameter",
                    index: parameterIndex,
                    target,
                    type: propertyType,
                };

                return retrievalProvider(container, field);
            };
        }
    };
