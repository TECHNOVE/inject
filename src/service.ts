export interface ServiceData {
    singleton: boolean;
}

const SERVICE_KEY = "__service__";
export const defaultData: ServiceData = {
    singleton: false,
};

export function setServiceData(object: any, data: ServiceData) {
    Reflect.defineMetadata(SERVICE_KEY, data, object);
}

export function getServiceData(object: any): ServiceData {
    const metadata = Reflect.getMetadata(SERVICE_KEY, object);
    return metadata || {...defaultData};
}
