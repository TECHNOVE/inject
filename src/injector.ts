import { Provider } from "./types";

export interface InjectedData {
    provider: Provider;
}

const INJECT_KEY = "__inject__";

// eslint-disable-next-line @typescript-eslint/ban-types
export function getInjectedData(Service: Object): InjectedData[] {
    return Reflect.getMetadata(INJECT_KEY, Service) || [];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function setInjectedData(Service: Object, injected: InjectedData[]) {
    Reflect.defineMetadata(INJECT_KEY, injected, Service);
}
