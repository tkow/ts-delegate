import {OnlyFunctionKeys} from './types'

function createDelegable<
  K extends { new(...args: any[]): {} },
  F extends OnlyFunctionKeys<InstanceType<K>> = OnlyFunctionKeys<InstanceType<K>>
>(target: K, opts?: {interfaceClass?: {} ,except?: F[], delegate?: F[] }): { new (...args: any[]): Pick<InstanceType<K>, F>} {
  if(opts?.except && opts.delegate) throw new Error();
  const interfaceClass: any = opts?.interfaceClass || class {}
  let dummyMethodNames = (opts?.delegate || Object.keys(target.prototype))

  if(opts?.except) {
    dummyMethodNames = dummyMethodNames.filter(name => !opts.except?.includes(name as F))
  }

  new Set(dummyMethodNames).forEach(dummyMethodName => {
    interfaceClass.prototype[dummyMethodName] = function(...args: any[]) {}
  })

  return interfaceClass
}


type Constructor = { new(...args: any[]): {} }
type InferInstanceKey<K extends Constructor> = OnlyFunctionKeys<UnionToIntersection<InstanceType<K>>>
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type ArgTemplate<C extends Constructor>  = (C | {class: C, opts?: {except?: InferInstanceKey<C>[], delegate?: InferInstanceKey<C>[] }})
type ExtractConstructor<K extends ArgTemplate<any>> = K extends Constructor ? K : K extends { class: infer B} ? B extends Constructor ? B : K: Constructor

function Delegable<
  K extends ArgTemplate<any>[],
  // D extends K[number] extends Constructor ? K[number] : K[number] extends {class: infer KK} ? KK : Constructor,
  // E extends InferFunctionKeys<K[number]> = InferFunctionKeys<K[number]>
>(...args: K): { new (...args: any[]):
  Pick<UnionToIntersection<InstanceType<ExtractConstructor<K[number]>>>, keyof UnionToIntersection<InstanceType<ExtractConstructor<K[number]>>>>
} {
  return args.reduce((acc, arg) => {
    if(arg instanceof Function) return createDelegable(arg as Constructor, {interfaceClass: acc})
    return createDelegable(arg.class, { interfaceClass: acc, ...arg?.opts} as any)
  }, class {}) as any
}

class X {
    constructor() {
    }

    hello = () => {
      console.log('hello');
    }
}

class Y {
    constructor() {
    }

    goodbye = () => {
      console.log('hello');
    }
}

type Z = Pick<X&Y, 'goodbye' | 'hello'>
type ddd = keyof (X | Y)
type DD = ArgTemplate<typeof X | typeof Y>
type DDD = ExtractConstructor<DD>

// @Delegable(X)
class A extends Delegable(X,
  {class: Y, opts: {except: ['hello']}},
  // Y
){

  // hello: () => void = () => {};

}

const a = new A()

a.goodbye
