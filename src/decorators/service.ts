export interface ServiceProps {
}
export const SERVICE_KEY = "__service__";

export const Service = (data?: ServiceProps) => (target: any) => {
    Reflect.defineMetadata(SERVICE_KEY, data || {}, target);
};
