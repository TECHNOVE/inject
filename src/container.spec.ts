import {expect} from "chai";
import {describe, it} from "mocha";
import {Container} from "./container";
import {Key} from "./key";
import {Service} from "./decorators/service";
import {Inject} from "./decorators/inject";

describe("Container", () => {
    it("should be able to create a container", () => {
        const container = new Container();
        expect(container).be.instanceOf(Container);
    });

    it("should be able to register a value", () => {
        const container = new Container();
        const key = new Key<number>("test");
        container.setValue(key, 5);
        expect(container.getValue(key)).to.equal(5);
    });

    it("should be able to remove a value", () => {
        const container = new Container();
        const key = new Key<number>("test");
        container.setValue(key, 5);
        const prev = container.removeValue(key);
        expect(container.getValue(key)).to.equal(undefined);
        expect(prev).to.equal(5);
    });

    it("should be able to register a service", () => {
        @Service()
        class SimpleService {
            public val: number = 5;
        }

        const container = new Container();
        const service = container.get(SimpleService);

        expect(service).to.be.instanceOf(SimpleService);
        expect(service.val).to.equal(5);
        expect(container.get(SimpleService)).to.equal(service);
    });

    it("should be able to handle self referential services", () => {
        @Service()
        class SelfService {
            @Inject()
            public val!: SelfService;
        }

        const container = new Container();
        const service = container.get(SelfService);

        expect(service).to.be.instanceOf(SelfService);
        expect(service.val).to.equal(service);
    });

    it("should be able to handle dependent services", () => {
        @Service()
        class SimpleService {
            @Inject()
            public val!: number;
        }

        @Service()
        class DepService {
            @Inject()
            public val!: SimpleService;
        }

        const container = new Container();
        const service = container.get(DepService);

        expect(service).to.be.instanceOf(DepService);
        expect(service.val).to.be.instanceOf(SimpleService);
    });

    it("should be able to handle many levels of dependent services", () => {
        @Service()
        class SimpleService {
            public val: number = 5;
        }

        @Service()
        class DepService {
            @Inject()
            public val!: SimpleService;
        }

        @Service()
        class Dep2Service {
            @Inject()
            public val!: DepService;
        }

        @Service()
        class Dep3Service {
            @Inject()
            public val!: Dep2Service;
        }

        const container = new Container();
        const service = container.get(Dep3Service);

        expect(service).to.be.instanceOf(Dep3Service);
        expect(service.val).to.be.instanceOf(Dep2Service);
        expect(service.val.val).to.be.instanceOf(DepService);
        expect(service.val.val.val).to.be.instanceOf(SimpleService);
        expect(service.val.val.val.val).to.equal(5);
    });

});
