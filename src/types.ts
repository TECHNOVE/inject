/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */

import { Container } from "./container";
import { Field } from "./field";

export type Constructor<T> = Function & { prototype: T };

export type PropertyType =
    | String
    | Number
    | Boolean
    | Date
    | Array<any>
    | Constructor<any>;

export type Provider<T> = (
    container: Container,
    target: Object
) => any | Promise<any>;

export type ParameterProvider<T> = (
    container: Container,
    target: Constructor<T>
) => any | Promise<any>;

export type FieldProvider<T> = (
    container: Container,
    field: Field<T>
) => T | Promise<T>;
