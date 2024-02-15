import {OnlyFunctionKeys} from './types'

function createDelegatable<
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
type InferConstructor<K> = K extends Constructor ? K : K extends {class: any} ? K['class'] : any
type InferFunctionKeys<K> = K extends Constructor ? OnlyFunctionKeys<InstanceType<K>> : K extends {class: any} ? OnlyFunctionKeys<InstanceType<K['class']>> : any
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

function Delegatable<
  K extends (Constructor | {class: Constructor, opts?: {except?: F[], delegate?: F[] }})[],
  F extends InferFunctionKeys<K[number]> = InferFunctionKeys<K[number]>
>(...args: K): { new (...args: any[]): Pick<UnionToIntersection<InstanceType<InferConstructor<K[number]>>>, F>} {
  return args.reduce((acc, arg) => {
    if(arg instanceof Function) return createDelegatable(arg as Constructor, {interfaceClass: acc})
    return createDelegatable(arg.class, { interfaceClass: acc, ...arg?.opts} as any)
  }, class {}) as { new (...args: any[]): Pick<UnionToIntersection<InstanceType<InferConstructor<K[number]>>>, F>}
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

// @Delegatable(X)
class A extends Delegatable(X, {class: Y, opts: {except: ['goodbye']}){

  // hello: () => void = () => {};

}

const a = new A()

a.goodbye
