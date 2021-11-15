import { defaultData, setServiceData } from "../service";
import { Constructor } from "../types";

export interface ServiceProps {
    singleton: boolean;
}

export const Service: (data?: Partial<ServiceProps>) => ClassDecorator =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data?: Partial<ServiceProps>) => (target: Constructor<any>) => {
        setServiceData(target, {
            ...defaultData,
            ...(data || {}),
        });
    };
