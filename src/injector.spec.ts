import { expect } from "chai";
import { getInjectedData } from "./injector";

describe("injector", () => {
    it("returns an empty array for a new object", () => {
        class A {}

        expect(getInjectedData(A.prototype).properties).length(0);
        expect(getInjectedData(A.prototype).parameters).length(0);
    });

    it("returns same object each time", () => {
        class A {}

        expect(getInjectedData(A.prototype)).to.be.equal(
            getInjectedData(A.prototype)
        );
    });
});
