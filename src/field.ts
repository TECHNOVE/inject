import { Constructor, PropertyType } from "./types";

export type FieldProperty<T> = {
    fieldType: "property";

    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object;

    type: PropertyType;
    defaultValue: T;
};

export type FieldParameter = {
    fieldType: "parameter";

    target: Constructor<unknown>;

    type: PropertyType;
};

export type Field<T> = FieldProperty<T> | FieldParameter;
