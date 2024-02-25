import { OnlyFunctionKeys } from "./types";

function getAllDefinedFunction(target: any) {
  const prototype = Object.getPrototypeOf(target);
  const instanceMethods = Object.getOwnPropertyNames(prototype).filter(
    (name) => typeof prototype[name] === "function"
  );
  const propertyFunctions = Object.getOwnPropertyNames(target).filter(
    (name) => typeof target[name] === "function"
  );
  return instanceMethods.concat(propertyFunctions);
}

function createClassId(klass: Constructor): string | symbol {
  if (!klass.name) {
    const sym = Symbol();
    (klass as any)["name"] = sym;
    return sym;
  }
  return klass.name;
}

type Constructor<P = any> = { new (...args: any[]): P };

type InferInstanceKey<K extends Constructor> = OnlyFunctionKeys<
  UnionToIntersection<InstanceType<K>>
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type ArgTemplate<C extends Constructor> =
  | C
  | {
      class: C;
      opts: {
        except?: InferInstanceKey<C>[];
        delegate?: InferInstanceKey<C>[];
      };
    };

type ExtractConstructor<K extends ArgTemplate<any>> = K extends Constructor
  ? K
  : K extends { class: infer B }
  ? B
  : Constructor;

type ExtractDelegateKeys<K extends ArgTemplate<any>> = K extends Constructor
  ? keyof InstanceType<K>
  : K extends { opts: { delegate: any } }
  ? K["opts"]["delegate"][number]
  : K extends { class: infer A extends Constructor }
  ? keyof InstanceType<A>
  : never;

type ExtractExceptKeys<K extends ArgTemplate<any>> = K extends Constructor
  ? never
  : K extends { opts: { except: any } }
  ? K["opts"]["except"][number]
  : never;

type PickedKeys<K> = Exclude<ExtractDelegateKeys<K>, ExtractExceptKeys<K>>;

interface DelegableInstance {
  delegateAll<P extends object>(
    delegateInstance: P | (() => P),
    opts?: { methods?: string[]; class?: Constructor }
  ): (() => void) | void;
  duckTyping<P extends object>(
    delegateInstance: P,
    opts?: { methods?: string[]; class?: Constructor }
  ): this;
}

export function Delegable<
  R extends Constructor<
    Pick<
      UnionToIntersection<InstanceType<ExtractConstructor<K[number]>>>,
      PickedKeys<K[number]>
    > &
      DelegableInstance
  >,
  K extends ArgTemplate<any>[] = ArgTemplate<any>[]
>(args: K): R {
  let methodMap: Record<symbol | string, { delegate?: []; except?: string[] }> =
    {};
  for (let arg of args) {
    if (!(arg instanceof Function)) {
      const key = createClassId(arg.class);
      methodMap[key] = arg.opts;
    }
  }
  const accessor = Symbol();
  const loadDelegateInstances = Symbol();

  return class {
    private __privateDelegatorMap: Record<string | symbol, any> = {};

    get [accessor]() {
      return this.__privateDelegatorMap;
    }

    [loadDelegateInstances](key?: symbol) {
      if (!this.__privateDelegatorMap[loadDelegateInstances]) return;
      if (key) {
        if (!this.__privateDelegatorMap[loadDelegateInstances][key]) return;

        this.__privateDelegatorMap[loadDelegateInstances][key]();
        delete this.__privateDelegatorMap[loadDelegateInstances][key];
        if (
          Object.getOwnPropertySymbols(
            this.__privateDelegatorMap[loadDelegateInstances]
          ).length <= 0
        ) {
          this.__privateDelegatorMap[loadDelegateInstances] = undefined;
        }
      } else {
        Object.getOwnPropertySymbols(
          this.__privateDelegatorMap[loadDelegateInstances]
        ).forEach((key) => {
          this.__privateDelegatorMap[loadDelegateInstances][key]();
          delete this.__privateDelegatorMap[loadDelegateInstances][key];
        });
        this.__privateDelegatorMap[loadDelegateInstances] = undefined;
      }
    }

    constructor() {
      return new Proxy(this, {
        get(instance, prop) {
          if ((instance as any)[prop]) return (instance as any)[prop];
          let targetInstance = (instance as any)[accessor][prop];
          if (!targetInstance) {
            if (instance.__privateDelegatorMap[loadDelegateInstances]) {
              instance[loadDelegateInstances]();
            }
            targetInstance = (instance as any)[accessor][prop];
          }
          if (
            typeof targetInstance === "function" &&
            targetInstance.name === "__lazyLoad"
          ) {
            targetInstance();
            targetInstance = (instance as any)[accessor][prop];
          }
          if (!targetInstance) return undefined;

          const getter = targetInstance[prop];
          return getter;
        },
      });
    }

    duckTyping<P extends object>(
      delegateInstance: P,
      opts?: { methods?: string[]; class?: Constructor }
    ) {
      this.delegateAll(delegateInstance, opts);
      return this;
    }

    delegateAll<P extends object>(
      delegateInstance: P | (() => P),
      opts?: { methods?: string[]; class?: Constructor }
    ) {
      const isLazy = typeof delegateInstance === "function";
      const methodRule =
        methodMap[(opts?.class || delegateInstance.constructor).name];

      if (isLazy) {
        if (!this.__privateDelegatorMap[loadDelegateInstances]) {
          this.__privateDelegatorMap[loadDelegateInstances] = {};
        }

        const lazyLoadSymbol = Symbol();

        this.__privateDelegatorMap[loadDelegateInstances][lazyLoadSymbol] =
          () => {
            const lazyInstance = delegateInstance();
            this.delegateAll(lazyInstance, opts);
          };

        let __lazyLoad = () => {
          this[loadDelegateInstances](lazyLoadSymbol);
        };

        if (__lazyLoad.name !== "__lazyLoad") {
          (__lazyLoad as any).name = "__lazyLoad";
        }

        const methods = (opts?.methods ?? methodRule?.delegate ?? []).filter(
          (org) => !(methodRule?.except || []).includes(org)
        );

        if (methods.length > 0) {
          methods.forEach((prop) => {
            this.__privateDelegatorMap[prop] = __lazyLoad;
          });
        }

        return __lazyLoad;
      }

      const methods = (
        opts?.methods ??
        methodRule?.delegate ??
        getAllDefinedFunction(delegateInstance)
      ).filter((org) => !(methodRule?.except || []).includes(org));
      const methodsSet = new Set(methods);
      methodsSet.forEach((prop) => {
        this.__privateDelegatorMap[prop] = delegateInstance;
      });
    }
  } as any;
}
