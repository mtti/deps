TypeScript/JavaScript dependency injection without decorators and reflection.

## Usage

```typescript
import { Registry, injectableClass, injectableFactory } from '@mtti/deps';

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

function createBar(FooDependency foo): BarDependency {
    return new BarDependency(foo);
}
injectableFactory(createBar, [ FooDependency ]);

const registry = new Registry();
registry.addFactory(BarDependency, createBar);

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

const myService = registry.Resolve(MyService);
```

## Use as a service locator

You can add and retrieve services manually:

```typescript
import { Registry } from '@mtti/deps';

// Define a dependency
class MyService {}

// Create a registry
const registry = new Registry();

// Bind an instance of MyService
registry.bind(MyService, new MyService());

// The created instace can now be retrieved with
const myService: MyService = registry.get(MyService);
```
