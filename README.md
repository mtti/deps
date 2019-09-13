[![npm version](https://badge.fury.io/js/%40mtti%2Fdeps.svg)](https://badge.fury.io/js/%40mtti%2Fdeps) [![Build Status](https://travis-ci.org/mtti/deps.svg?branch=master)](https://travis-ci.org/mtti/deps)

TypeScript/JavaScript dependency injection inspired by AngularJS to avoid the use of decorators or reflection.

## Class dependencies

Use `injectClass()` to add type metadata to classes, create an `Injector` instance and call `.resolve()` on it with your application's main class to resolve the whole dependency chain.

With classes, Injector checks incoming and outgoing instances at runtime to make sure they are implementations of their bound class.

```typescript
import { Injector, injectClass } from '@mtti/deps';

class Foo {}
injectClass([], Foo);

class Bar {
    private _foo: Foo;

    constructor(foo: Foo) {
        this._foo = foo;
    }
}
injectClass([Foo], Bar);

(async () => {
    const injector = new Injector();
    const bar = injector.resolve(Bar);

    // ...
})();
```

## Partially applied functions

In addition to classes, dependencies can also be partially applied functions. The outer function receives the dependencies and returns the inner function which will be available from the injector, bound to the type of the outer function.

You lose some type safety this way, but don't have to use ES classes if you don't want to.

```typescript
import { Injector, injectFunction } from '@mtti/deps';
import { DBClient } from './my-db-client';

type GetUserFunc = (id: string) => Promise<Record<string, unknown>>;

function getUser(db: DBClient): Promise<GetUserFunc> {
    return async (id: string): Promise<Record<string, unknown>> => {
        return db.findOne({ id });
    };
}
injectFunction([DBClient], getUser);

(async () => {
    const injector = new Injector();
    const getUser = injector.resolve<GetUserFunc>(getUser);

    const user = await getUser('some-user-id');

    // ...
})();
```

## Manual binding

You can manually bind instances you've created yourself. Useful for testing.

```typescript
import { Injector, injectClass } from '@mtti/deps';

class Foo {}
injectClass([], Foo);

class Bar {
    private _foo: Foo;

    constructor(foo: Foo) {
        this._foo = foo;
    }
}
injectClass([Foo], Bar);

(async () => {
    const injector = new Injector();
    injector.bind(Foo, new Foo());
    const bar = injector.resolve(Bar);

    // ...
})();
```

## Factories

You can register a factory function for lazy asynchronous initialization:

```typescript
import { Injector, injectClass } from '@mtti/deps';

class Foo {}
injectClass([], Foo);

class Bar {
    private _foo: Foo;

    constructor(foo: Foo) {
        this._foo = foo;
    }
}
injectClass([Foo], Bar);

async function createFoo(): Promise<Foo> {
    return new Foo();
}

(async () => {
    const injector = new Injector();
    injector.provide(Foo, createFoo);
    const bar = injector.resolve(Bar);

    // ...
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
