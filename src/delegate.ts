import {
  DelegateFunctionRes,
  DelegateFunctionArg,
  OnlyFunctionKeys,
  DelegateFunction,
} from "./types";

export { Delegable } from "./delegateAll";

export const DELEGATOR_ID = "__delegator";

export const delegateProxy = <T extends object, P extends object>(
  self: T,
  delegateInstance: P,
  opts: { delegatorId?: string | symbol } = {}
): P => {
  const { delegatorId = DELEGATOR_ID } = opts;
  const proxy = new Proxy(delegateInstance as T & P, {
    get: function (obj: P, prop: Extract<keyof P, string>) {
      const target = obj[prop as keyof P];
      if (typeof target === "function") {
        return (target as any).bind(obj);
      } else {
        return target;
      }
    },
  });
  Object.assign(self, { [delegatorId]: proxy });
  return proxy as P;
};

export const delegate = <
  P extends object,
  K extends OnlyFunctionKeys<P> = OnlyFunctionKeys<P>
>(
  id: K,
  options: { delegatorId?: string | symbol } = {}
): DelegateFunction<P[K]> => {
  const { delegatorId = DELEGATOR_ID } = options;

  type Args = DelegateFunctionArg<P[K]>;
  type Res = DelegateFunctionRes<P[K]>;

  const delegateMethod = function (this: any, ...args: Args): Res {
    return this[delegatorId][id](...args);
  };

  return delegateMethod as DelegateFunction<P[K]>;
};
