import { executeArrayMaybePromise, getAllPrototypes } from "./utils";
import { expect } from "chai";

describe("getAllPrototypes", () => {
    it("returns single prototype for simple class", () => {
        class A {}
        class B {}

        expect(getAllPrototypes(A)).to.have.members([A]);
        expect(getAllPrototypes(A)).to.not.have.members([B]);
    });

    it("returns prototypes for each extended class", () => {
        class A {}
        class B extends A {}
        class C extends B {}

        expect(getAllPrototypes(C)).to.have.ordered.members([C, B, A]);
    });

    it("returns prototypes in the right order", () => {
        class A {}
        class B extends A {}
        class C extends B {}
        class D extends C {}

        expect(getAllPrototypes(D)).to.have.ordered.members([D, C, B, A]);
    });
});

describe("executeArrayMaybePromise", () => {
    it("returns no promise if no promised functions", () => {
        const val = [() => 1, () => 2];

        expect(executeArrayMaybePromise(val)).to.deep.equal([1, 2]);
    });

    it("returns a promise if promised functions", () => {
        const val = [() => Promise.resolve(1), () => 2];

        expect(executeArrayMaybePromise(val)).to.be.instanceOf(Promise);
    });

    it("returns an array of all the values", () => {
        const val = [() => 1, () => 2];

        expect(executeArrayMaybePromise(val)).to.deep.equal([1, 2]);
    });

    it("returns an array of all the promised values", async () => {
        const val = [() => Promise.resolve(1), () => 2];

        expect(await executeArrayMaybePromise(val)).to.deep.equal([1, 2]);
    });
});
