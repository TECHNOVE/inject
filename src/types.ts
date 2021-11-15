import {Container} from "./container";

export type Constructor<T> = Function & { prototype: T };
export type PropertyType = String | Number | Boolean | Date | Array<any> | Constructor<any>;
export type Provider = (container: Container, target: Object) => any | Promise<any>;
export type FieldProvider = (container: Container, target: Object, propertyName: string, propertyType: PropertyType) => any | Promise<any>;

