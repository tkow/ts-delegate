export type DelegateFunction<F> = F extends (...args: any) => any ? F : never;
export type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
export type StringKeyOf<K> = keyof K & string;
export type OnlyFunctionKeys<P> = StringKeyOf<
  PickMatching<P, (...args: any) => any>
>;
export type DelegateFunctionArg<P> = P extends (...args: infer A) => any
  ? A
  : any;

export type DelegateFunctionRes<P> = P extends (...args: any) => infer R
  ? R
  : any;
