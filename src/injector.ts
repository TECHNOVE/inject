import { ParameterProvider, Provider } from "./types";

export interface InjectedData {
    properties: Provider[];
    parameters: ParameterProvider<unknown>[];
}

const INJECT_KEY = "__inject__";

// eslint-disable-next-line @typescript-eslint/ban-types
export function getInjectedData(Service: Object): InjectedData {
    if (Reflect.hasMetadata(INJECT_KEY, Service)) {
        return Reflect.getMetadata(INJECT_KEY, Service);
    }
    const data: InjectedData = {
        properties: [],
        parameters: new Array(Service.constructor.length),
    };
    Reflect.defineMetadata(INJECT_KEY, data, Service);
    return data;
}
