# @technove/inject

![Badge](https://img.shields.io/npm/v/@technove/inject?style=for-the-badge)

A dependency injection library for TypeScript.
With full support for custom injectors using promises.

## Installation

```
yarn add @technove/inject reflect-metadata
```

Or on npm:

```
npm install --save @technove/inject reflect-metadata
```

Then at the top of your application's entry point, add the following line:

```ts
import "reflect-metadata";
```

## Usage

### Defining a service

```ts
import {get, Service} from "@technove/inject";

class MyLogger {
    log(message: string) {
        console.log(message);
    }
}

const logger = get(MyLogger); // when you need to get the service
logger.log("Hello, World!"); // -> "Hello, World!"

// the instance will always be the same for repeated calls
const logger2 = get(MyLogger);
logger === logger2; // true!
```

### Using Abstract Classes

A popular use-case for dependency injection is to define a different implementation for each environment.
This is possible by declaring an abstract class, then extending it for each environment.

```ts
import {get, register, Service} from "@technove/inject";

// logger.ts

abstract class Logger {
    abstract log(message: string): void;
}

// application.ts

class ProductionLogger extends Logger {
    log(message: string) {
        console.log("PROD:", message);
    }
}

register(ProductionLogger);

// test.ts

class TestingLogger extends Logger {
    log(message: string) {
        console.log("TEST:", message);
    }
}
register(TestingLogger);

// whenever you need a logger
const logger = get(Logger);
logger.log("Hello, World!");
```

### Using Services in Other Services

Often you'll create a service that depends on another service.
This is very easy to use, and is very flexible.

```ts
import {get, Service} from "@technove/inject";

class Logger {
    log(message: string) {
        console.log(message);
    }
}

class MyService {
    @Inject()
    private readonly logger!: Logger; // when you call get(MyService) the first time, this value will be filled
    
    logMessage() {
        this.logger.log("Hello, World!");
    }
}

get(MyService).logMessage(); // -> "Hello, World!"
```

### Creating Custom Injection Providers

Sometimes you may want to create a custom provider.
This is made very simple!

```ts
import {get, FieldProvider, Inject} from "@technove/inject";

const provider: FieldProvider = () => "Hello, World!";

class MyService {
    @Inject(provider)
    private readonly message!: string;
    
    logMessage() {
        console.log(this.message);
    }
}

get(MyService).logMessage(); // -> Hello, World!
```

These providers have access to the container, so they can even access other services!
In fact, when you don't give a provider this is nearly equivalent what the default `@Inject()` uses:

```ts
const provider: FieldProvider = (container: Container) => container.get(Logger);
```

If you take arguments, you can make this fairly powerful.
Say you had a filesystem service, you could use it to read files and inject it into your service:

```ts
const ReadFile = (path: string) => (container: Container) => container.get(FileSystem).readFile(path);

class MyService {
    @Inject(ReadFile("myfile.json"))
    private readonly data!: string;
}
```

### Creating Custom Injectors with Promises

This idea is taken even further once you add promises to it.
`FieldProvider`s can be marked async and return promised values.

```ts
const ReadJson = (path: string) => async () => {
    const contents = await readFile(path, "utf-8");
    return JSON.parse(contents);
};

class MyService {
    @Inject(ReadFile("myfile.json"))
    private readonly data!: any;
}

// NOTE:
// using `get(MyService)` will throw an error, because you cannot load services with async values using it.
// instead use the following:

await load(MyService).data // has data from myfile.json!
```

## License

MIT
