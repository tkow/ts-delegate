import { it, expect } from "bun:test";
import { delegate, delegateProxy } from "./delegate";

interface IChild {
  hello: (name: string) => string;
  goodbye: () => string;
}

class Child implements IChild {
  private name = "foo";

  myName() {
    return this.name;
  }

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
  myName = delegate<Child, "myName">("myName");
}

it("should pass", () => {
  expect(new Parent().hello("World")).toBe("Hello, World"); // 'Hello, World'
  expect(new Parent().goodbye()).toBe("Goodbye"); // 'Goodbye'
  expect(new Parent().myName()).toBe("foo"); // 'foo'
});

it("plain object", () => {
  const obj = {} as Pick<IChild, "hello">;
  delegateProxy(obj, new Child());
  obj.hello = delegate<Child, "hello">("hello").bind(obj);

  expect(obj.hello("World")).toBe("Hello, World"); // 'Hello, World'
});
