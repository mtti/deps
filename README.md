TypeScript/JavaScript dependency injection without decorators and reflection.

In its most basic use case:

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
