import { Service } from "./service";
import { getServiceData } from "../service";
import { expect } from "chai";

describe("@Service", () => {
    it("adds service data to the class", () => {
        @Service({ singleton: false })
        class A {}

        expect(getServiceData(A)).to.deep.equal({ singleton: false });
    });
});
