import { expect } from "chai";
import { PostInjection } from "./post-injection";
import { getInjectedData } from "../injector";

describe("@PostInjection", () => {
    it("should be a function", () => {
        expect(typeof PostInjection).to.be.equal("function");
    });

    it("adds a function to the injected data", () => {
        class MyClass {
            @PostInjection()
            public async post() {
                console.log("finished injection");
            }
        }

        const injectedData = getInjectedData(MyClass.prototype);
        expect(injectedData.postInjection.length).to.be.equal(1);
    });

    it("adds multiple functions to the injected data", () => {
        class MyClass {
            @PostInjection()
            public async post() {
                console.log("finished injection");
            }

            @PostInjection()
            public async post2() {
                console.log("finished injection");
            }
        }

        const injectedData = getInjectedData(MyClass.prototype);
        expect(injectedData.postInjection.length).to.be.equal(2);
    });

});
