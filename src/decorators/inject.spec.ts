import { Inject } from "./inject";
import { getInjectedData } from "../injector";
import { expect } from "chai";
import { it } from "mocha";

describe("@Inject", () => {
    it("adds injected data to the class", () => {
        class A {
            @Inject()
            val = 5;
        }

        const data = getInjectedData(A.prototype);
        expect(data.properties).length(1);
    });

    it("handles being used in constructor", () => {
        class Service {}

        class A {
            constructor(@Inject() val: Service) {}
        }
    });

    it("errors when self referring in the constructor", () => {
        expect(() => {
            class A {
                constructor(@Inject() public val: A) {}
            }
        }).to.throw("Cannot inject self in constructor");
    });
});
