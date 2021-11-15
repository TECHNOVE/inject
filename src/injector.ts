import {Provider} from "./decorators/inject";

export interface InjectedData {
    provider: Provider;
}

export const INJECT_KEY = "__inject__";
