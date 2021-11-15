import { Inject } from "./inject";
import { getInjectedData } from "../injector";
import { expect } from "chai";

describe("@Inject", () => {
    it("adds injected data to the class", () => {
        class A {
            @Inject()
            val = 5;
        }

        const data = getInjectedData(A.prototype);
        expect(data).length(1);
    });
});
