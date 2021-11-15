import {
    defaultData,
    getServiceData,
    ServiceData,
    setServiceData,
} from "./service";
import { expect } from "chai";

describe("service", () => {
    it("returns default data for new constructable", () => {
        class A {}

        expect(getServiceData(A)).to.deep.equal(defaultData);
    });

    it("can set and retrieve service data", () => {
        class A {}

        const data: ServiceData = {
            singleton: true,
        };

        setServiceData(A, data);
        expect(getServiceData(A)).to.deep.equal(data);
    });
});
