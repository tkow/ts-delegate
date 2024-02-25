## ts-delegate

A library makes delegate method with type inherited.

## Usage

```ts
import { delegate, delegateProxy } from '@tkow/ts-delegate'

interface IChild {
  hello: (name: string) => string;
  goodbye: () => string;
}

class Child implements IChild {
  hello(name: string) {
    return `Hello, ${name}`;
  }
  goodbye() {
    return "Goodbye";
  }
}

class Parent {
  constructor() {
    delegateProxy(this, new Child());
  }
  hello = delegate<Child, "hello">("hello");
  goodbye = delegate<Child, "goodbye">("goodbye");
}

console.log(new Parent().hello("World")); // 'Hello, World'
console.log(new Parent().goodbye()); // 'Goodbye'
```

The hello and goodbye methods' types are inherited from Child class.

![example](./images//examle.jpg "example")

## API

### delegateProxy(obj, to, {delegatorId?: string})

The `obj` is an object delegates method to object's set to `to`.
Proxy to delegate is set internal variable default named `__delegator` of obj.
If you want multiple instance to delegate, use unique delegatorId by each internal instance.

```ts
class Parent {
  constructor() {
    delegateProxy(this, new Child1(), { delegatorId: "__child1" });
    delegateProxy(this, new Child2(), { delegatorId: "__child2" });
  }
  hello = delegate<Child1, "hello">("hello", { delegatorId: "__child1" });
  goodbye = delegate<Child2, "goodbye">("goodbye", {
    delegatorId: "__child2",
  });
}
```

You can also use symbol as delegatorId by each class for example,

```ts
class Parent {
  static DELEGATOR_ID = {
    child1: symbol(),
    child2: symbol(),
  };
  constructor() {
    delegateProxy(this, new Child1(), {
      delegatorId: Parent.DELEGATOR_ID.child1,
    });
    delegateProxy(this, new Child2(), {
      delegatorId: Parent.DELEGATOR_ID.child2,
    });
  }
  hello = delegate<Child1, "hello">("hello", {
    delegatorId: Parent.DELEGATOR_ID.child1,
  });
  goodbye = delegate<Child2, "goodbye">("goodbye", {
    delegatorId: Parent.DELEGATOR_ID.child2,
  });
}
```

### delegate<InstanceClass, MethodName extends string>(methodName: MethodName, {delegatorId: '\_\_child1'})

It maps proxy method to parent class's instance. delegatorId can be specified to which instance methods be mapped to their parent as already described.
It can map plain object using binding instance. You should two type parameters for method's type inheritance.

```ts
const obj = {} as Pick<IChild, "hello">;
delegateProxy(obj, new Child());
obj.hello = delegate<Child, "hello">("hello").bind(obj);
// or
obj.hello = delegateProxy(obj, new Child()).hello;

console.log(obj.hello("World")); // 'Hello, World'
```

### Delegable(args: (Constructor | {class: Constructor, opts?: {delegate: keyof Instance[], except: keyof Instance[] }})[])

You may often want to remap all methods of an object to parent class without writing codes explicitly.
You can do this using Delegable API. This makes new class constructor implements public methods, named `delegateAll` and `duckTyping`, and private property, named `__privateDelegatorMap`.
So, if you use this class, be careful not to override them or handle them appropriately to call super method if you need.
You can restrict delegate methods using the opts and they confines type of delegated methods with fixed type using `as const`. This options only confines types and actual mapping delegate methods runs when you call delegateAll with instance argument or calling explicitly load function returned by `delegateAll` or first calling a delegate method with first function argument to initialize instance.

`delegateAll<I extends object>(delegateInstance: I | (() => I), opts?: { methods?: string[]; class?: Constructor })`: remap delegateInstance methods to parent class. If first arg is function and methods or class options with Delegable's delegate, you can delay to initialize instance until you call some delegate methods.

See the [delegateAll.spec.ts](https://github.com/tkow/ts-delegate/tree/main/src/delegateAll.spec.ts) if you want more details.

You can specify delegate class to use in your inherited class and map delegate property by calling delegateAll.

Basic Usage:

```ts
class X {
  constructor() {}

  hello = () => {
    return "hello";
  };
}

class Y {
  constructor() {}

  hey = () => {
    return "hey";
  };

  hi = () => {
    return "hi";
  };

}


class Example extends Delegable([X, Y]) {
  constructor() {
    super();
    this.delegateAll(new X());
    this.delegateAll(new Y());
  }
}

const a = new Example
a.hello()
a.hey()
a.hi()
```

Confinements type:

```ts
class X {
  constructor() {}

  hello = () => {
    return "hello";
  };

  goodbye = () => {
    return 'goodbye'
  }
}

class Y {
  constructor() {}

  hey = () => {
    return "hey";
  };

  hi = () => {
    return "hi";
  };

}

// NOTE: You need `as const` to infer inherited class interface
class Example extends Delegable([
  {class: X, opts: { delegate: ['hello'] }},
  {class: Y, opts: { except: ['hi'] }}
] as const) {
  constructor() {
    super();
    this.delegateAll(new X());
    this.delegateAll(new Y());
  }
}

const a = new Example
a.hello() // ok
a.goodbye() // error
a.hey() // ok
a.hi() // error
```

LazyLoad:

```ts
class Example extends Delegable([X, Y]) {
  constructor() {
    super();
    this.delegateAll(() => {
       console.log('initializing X')
       new X()
    });
  }
}

const a = new Example();
expect(a.hello()).toBe("hello"); // with output: initializing X
```

DuckTyping:

```ts
class Animal extends Delegable([X]) {
  constructor() {
    super();
  }
}
class Dog {
  hello() {
    return "bow";
  }
}
class Cat {
  hello() {
    return "meow";
  }
}
class Invoker {
  constructor(
    private animal = new Animal()
  ) {}
  invoke(instance: X) {
    return this.animal.duckTyping(instance).hello();
  }
}

const i = new Invoker();
expect(i.invoke(new Dog)).toBe("bow");
expect(i.invoke(new Cat)).toBe("meow");
```

Caveat: The duckTyping remap all instance methods to proxy class and always rewrite instance methods by mapped methods, it may cause some performance problem when your instance have many instance methods and properties. If you don't want the behavior, specify `methods` options to restrict to map methods and cache duckTyping instance each by instance to avoid rewrite same props many times.

## License

MIT
