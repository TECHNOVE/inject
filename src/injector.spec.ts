import { expect } from "chai";
import { getInjectedData, InjectedData, setInjectedData } from "./injector";

describe("injector", () => {
    it("returns an empty array for a new object", () => {
        class A {}

        expect(getInjectedData(A)).length(0);
    });

    it("can set and retrieve injected data", () => {
        class A {}

        const data: InjectedData[] = [
            {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                provider: () => {},
            },
        ];

        setInjectedData(A, data);

        expect(getInjectedData(A)).to.deep.equal(data);
    });
});
