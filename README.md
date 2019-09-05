TypeScript/JavaScript dependency injection without decorators and reflection.

## Full example

```typescript
import { Injector, injectableClass, injectableFactory } from '@mtti/deps';

// A simple service with no dependencies of its own

class FooDependency {}

// A second service which depends on Foo and is created with a factory
// function.

class BarDependency {
    private _foo: FooDependency;

    constructor(foo: FooDependency) {
        this._foo = foo;
    }
}
injectableClass(BarDependency, [ FooDependency ]);

async function createBar(FooDependency foo): Promise<BarDependency> {
    return new BarDependency(foo);
}
injectableFactory(createBar, [ FooDependency ]);

const injector = new Injector();
injector.addFactory(BarDependency, createBar);

// A service which depends on both Foo and Bar

class MyService() {
    private _foo: FooDependency;
    private _bar: BarDependency;

    constructor(foo: FooDependency, bar: BarDependency) {
        this._foo = foo;
        this._bar = bar;
    }
}
injectableClass(MyService, [FooDependency, BarDependency]);

(async () => {
    const myService = await injector.resolve(MyService);
})();
```

## Use as a service locator

You can add and retrieve services manually:

```typescript
import { Injector } from '@mtti/deps';

// Define a dependency
class MyService {}

// Create an injector
const injector = new Injector();

// Bind an instance of MyService
injector.bind(MyService, new MyService());

// The created instace can now be retrieved with
const myService: MyService = injector.get(MyService);
```
