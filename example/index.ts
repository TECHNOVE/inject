import 'reflect-metadata';

import {Container, get, Inject, load, Service} from "../src";

@Service()
class SomeLogger {
    public log(message: string) {
        console.log(message);
    }
}

const loggerProvider = {
    provider: async (container: Container) => {
        return container.get(SomeLogger);
    },
};

@Service()
class MyStorage {
    @Inject(loggerProvider)
    public readonly logger!: SomeLogger;

    public doSomething() {
        this.logger.log("I did something!");
    }
}

load(MyStorage).then(inst => {
    inst.doSomething();
});

@Service()
class MyClass {
    @Inject()
    public readonly myClass!: MyClass;
}

const inst2 = get(MyClass);
console.log(inst2 === inst2.myClass);
