/* eslint-disable @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars */

import { Inject } from "./inject";
import { getInjectedData } from "../injector";
import { expect } from "chai";
import { it } from "mocha";
import { Container } from "../container";

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
            constructor(@Inject() public val: Service) {}
        }
    });

    it("errors when self referring in the constructor", () => {
        expect(() => {
            class A {
                constructor(@Inject() public val: A) {}
            }
        }).to.throw("Cannot inject self in constructor");
    });

    it("supports reading the default value", () => {
        class A {
            @Inject(
                (c, field) =>
                    field.fieldType === "property" && field.defaultValue
            )
            val = 5;
        }

        const container = new Container();
        const a = container.get(A);
        expect(a.val).to.be.equal(5);
    });
});
