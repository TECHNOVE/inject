import { expect } from "chai";
import { Key } from "./key";

describe("key", () => {
    it("should create keys", () => {
        const key = new Key<number>("test");
        expect(key.getId()).to.be.equal("test");
    });

    it("should create keys that are unique", () => {
        const key1 = new Key<number>("test");
        const key2 = new Key<number>("test2");
        expect(key1.getId()).to.be.equal("test");
        expect(key2.getId()).to.be.equal("test2");
        expect(key1).to.not.be.equal(key2);
    });
});
