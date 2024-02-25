import { describe, expect, it, mock } from "bun:test";
import { Delegable } from "./delegateAll";

class X {
  constructor() {}

  hello = () => {
    return "hello";
  };
}

class Y {
  constructor() {}

  goodbye = () => {
    return "goodbye";
  };
}

class Z {
  constructor() {}

  hey = () => {
    return "hey";
  };

  hi = () => {
    return "hi";
  };

  foo = () => {
    return "foo";
  };
}

describe("delegateAll", () => {
  class A extends Delegable([
    X,
    { class: Y, opts: { delegate: ["goodbye"] } },
    { class: Z, opts: { except: ["hey"] } },
  ] as const) {
    constructor() {
      super();
      this.delegateAll(new X());
      this.delegateAll(new Y());
      this.delegateAll(new Z());
    }
  }

  it("correct", () => {
    const a = new A();

    expect((a as any).hey).toBeUndefined();
    expect(a.goodbye()).toBe("goodbye");
    expect(a.hello()).toBe("hello");
    expect(a.hi()).toBe("hi");
    expect(a.foo()).toBe("foo");
  });
});

describe("dynamic delegateAll", () => {
  describe("should work", () => {
    class B extends Delegable([X, Y]) {
      constructor() {
        super();
      }

      activateX() {
        return this.delegateAll(() => new X());
      }

      activateY() {
        return this.delegateAll(() => new Y());
      }
    }

    it("normal", () => {
      const a = new B();

      expect(() => {
        expect(a.hello());
      }).toThrow();
      expect(() => {
        expect(a.goodbye());
      }).toThrow();

      a.activateX();

      expect(a.hello()).toBe("hello");
      expect(() => {
        expect(a.goodbye());
      }).toThrow();
    });

    it("load lazy Y", () => {
      const a = new B();
      const mockActivateY = mock(() => new Y());

      a.activateY = () => {
        a.delegateAll(mockActivateY);
      };

      const lazyLoad = a.activateX();
      a.activateY();
      lazyLoad?.();

      expect(a.hello()).toBe("hello");
      expect(mockActivateY).not.toHaveBeenCalled();
      expect(a.goodbye()).toBe("goodbye");
      expect(mockActivateY).toHaveBeenCalled();
    });

    it("auto load when call methods not loaded", () => {
      const a = new B();
      const mockActivateY = mock(() => new Y());

      a.activateY = () => {
        a.delegateAll(mockActivateY);
      };

      a.activateX();
      a.activateY();

      expect(a.hello()).toBe("hello");
      expect(mockActivateY).toHaveBeenCalled();
      expect(a.goodbye()).toBe("goodbye");
    });
  });

  it("should activate all if first method call", () => {
    class C extends Delegable([X, Y]) {
      constructor() {
        super();
        this.activateX();
        this.activateY();
      }

      mockX = mock(() => new X());
      mockY = mock(() => new Y());

      activateX() {
        this.delegateAll(this.mockX);
      }

      activateY() {
        this.delegateAll(this.mockY);
      }
    }

    const a = new C();
    expect(a.hello()).toBe("hello");
    expect(a.mockX).toHaveBeenCalled();
    expect(a.mockY).toHaveBeenCalled();
    expect(a.goodbye()).toBe("goodbye");
    const b = new C();
    expect(b.goodbye()).toBe("goodbye");
    expect(b.mockX).toHaveBeenCalled();
    expect(b.mockY).toHaveBeenCalled();
    expect(b.hello()).toBe("hello");
  });

  it("should load lazy independently when methods options or delegate value exist after excluded by except", () => {
    class D extends Delegable([
      { class: X, opts: { delegate: ["hello"] } },
      { class: Z, opts: { except: ["hi"] } },
    ] as const) {
      constructor() {
        super();
        this.activateX();
        this.activateZ();
      }

      mockX = mock(() => new X());
      mockZ = mock(() => new Z());

      activateX() {
        this.delegateAll(this.mockX, { class: X });
      }

      activateZ() {
        this.delegateAll(this.mockZ, { methods: ["hey"] });
      }
    }

    const a = new D();
    expect(a.hello()).toBe("hello");
    expect(a.mockX).toHaveBeenCalled();
    expect(a.mockZ).not.toHaveBeenCalled();
    expect(a.hey()).toBe("hey");
    expect(a.mockZ).toHaveBeenCalled();

    const b = new D();
    expect(b.hey()).toBe("hey");
    expect(b.mockX).not.toHaveBeenCalled();
    expect(b.hello()).toBe("hello");
    expect(b.mockX).toHaveBeenCalled();
  });

  describe("use duck typing", () => {
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
      constructor(private animal = new Animal()) {}

      invoke(instance: X) {
        return this.animal.duckTyping(instance).hello();
      }
    }

    it("should work", () => {
      const i = new Invoker();
      expect(i.invoke(new Dog())).toBe("bow");
      expect(i.invoke(new Cat())).toBe("meow");
    });
  });
});
