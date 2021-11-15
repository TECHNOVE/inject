import {defaultData, setServiceData} from "../service";

export interface ServiceProps {
    singleton: boolean;
}

export const Service = (data?: Partial<ServiceProps>) => (target: any) => {
    setServiceData(target, {
        ...defaultData,
        ...(data || {}),
    });
};
