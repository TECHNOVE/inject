import {Container} from "./container";

export type Constructor<T> = Function & { prototype: T };
export type Provider = (container: Container, target: Object) => any | Promise<any>;
export type FieldProvider = (container: Container, target: Object, propertyName: string) => any | Promise<any>;

