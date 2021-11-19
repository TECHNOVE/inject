import "reflect-metadata";

import { expect } from "chai";
import { describe, it } from "mocha";
import { Container } from "./container";
import { Key } from "./key";
import { Service } from "./decorators/service";
import { Inject } from "./decorators/inject";
import { PostInjection } from "./decorators/post-injection";

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

    it("should be able to register strings", () => {
        const container = new Container();
        const key = new Key<string>("test");
        container.setValue(key, "test");
        expect(container.getValue(key)).to.equal("test");
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
            public val = 5;
        }

        const container = new Container();
        const service = container.get(SimpleService);

        expect(service).to.be.instanceOf(SimpleService);
        expect(service.val).to.equal(5);
        expect(container.get(SimpleService)).to.equal(service);
    });

    it("should be able to handle dependent services", () => {
        class SimpleService {
            public val = 5;
        }

        class DepService {
            @Inject()
            public val!: SimpleService;
        }

        const container = new Container();
        const service = container.get(DepService);

        expect(service).to.be.instanceOf(DepService);
        expect(service.val).to.be.instanceOf(SimpleService);
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

    it("should be able to handle many levels of dependent services", () => {
        @Service()
        class SimpleService {
            public val = 5;
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

    it("should create different instances for singletons", () => {
        @Service({ singleton: false })
        class SimpleService {}

        const container = new Container();
        const service1 = container.get(SimpleService);
        const service2 = container.get(SimpleService);

        expect(service1).to.not.equal(service2);
    });

    it("can inject services into the constructor", () => {
        class SimpleService {
            public val = 5;
        }

        class A {
            constructor(@Inject() public service: SimpleService) {}
        }

        const container = new Container();
        expect(container.get(A).service).to.be.instanceOf(SimpleService);
    });

    it("can handle custom providers in the constructor", () => {
        const token = new Key<number>("multiplier");

        const Multiplier = (defaultValue?: number) =>
            Inject((container, field) => {
                if (field.type !== Number) {
                    throw new Error("Only usable on number params");
                }
                return (defaultValue || 1) * (container.getValue(token) || 5);
            });

        @Service({ singleton: false })
        class A {
            constructor(@Multiplier(5) public val: number) {}
        }

        @Service({ singleton: false })
        class B {
            constructor(@Multiplier() public val: number) {}
        }

        const container = new Container();
        expect(container.get(A).val).to.be.equal(5 * 5);
        expect(container.get(B).val).to.be.equal(5);

        container.setValue(token, 10);
        expect(container.get(A).val).to.be.equal(10 * 5);
        expect(container.get(B).val).to.be.equal(10);
    });

    it("errors when missing injects in constructor", () => {
        class A {
            constructor(public val: number) {}
        }

        const container = new Container();
        expect(() => container.get(A)).to.throw("found missing a @Inject");

        class B {
            constructor(
                @Inject() public val: number,
                public val2: string,
                @Inject() public val3: boolean
            ) {}
        }
        expect(() => container.get(B)).to.throw("found missing a @Inject");
    });

    it("calls after initialization", () => {
        let ran = false;

        class A {
            @PostInjection()
            private afterInit() {
                ran = true;
            }
        }

        const container = new Container();
        container.get(A);
        expect(ran).to.be.equal(true);

        class Dependency {
            public val = 5;
        }

        let retrievedValue = 0;
        class B {
            @Inject()
            private dep!: Dependency;

            @PostInjection()
            private afterInit(container: Container) {
                retrievedValue = container.get(Dependency).val + this.dep.val;
            }
        }

        container.get(B);
        expect(retrievedValue).to.be.equal(10);
    });

    it("handles after initialization with promise", async () => {
        let val = 0;
        class A {
            @PostInjection()
            private async init() {
                await new Promise((resolve) => setTimeout(resolve, 5));
                val = await Promise.resolve(5);
            }
        }

        const container = new Container();
        await container.load(A);

        expect(val).to.be.equal(5);
    });

    it("uses registered instance", () => {
        class A {
            constructor(public val: number) {}
        }

        class MyClass extends A {}

        const container = new Container();
        container.register(A, new MyClass(5));

        expect(container.get(A)).to.be.instanceOf(MyClass);
        expect(container.get(A).val).to.be.equal(5);
    });

    it("uses registered classes", () => {
        class A {
            constructor(public val: number) {}
        }

        class MyClass extends A {
            constructor() {
                super(5);
            }
        }

        const container = new Container();
        container.register(MyClass);

        expect(container.get(A)).to.be.instanceOf(MyClass);
        expect(container.get(A).val).to.be.equal(5);
    });

});
