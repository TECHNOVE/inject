import { getAllPrototypes } from "./utils";
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
