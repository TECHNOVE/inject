import { Constructor, PropertyType } from "./types";

export type FieldProperty<T> = {
    fieldType: "property";

    target: Object;

    type: PropertyType;
    defaultValue: T;
};

export type FieldParameter<T> = {
    fieldType: "parameter";

    target: Constructor<unknown>;

    type: PropertyType;
};

export type Field<T> = FieldProperty<T> | FieldParameter<T>;
