const DELEGATOR_NAME = '__delegator'

export const delegateProxy = <T extends object, P extends object>(self: T, delegateInstance: P, {
    delegatorName = DELEGATOR_NAME
} = {}): P => {
    const proxy = new Proxy(delegateInstance as T & P, {
        get: function (obj: P, prop: Extract<keyof P, string>) {
            const target = obj[prop as keyof P]
            if (typeof target === 'function') {
                return (target as any).bind(obj);
            } else {
                return target
            }
        }
    })
    Object.assign(self, { [delegatorName]: proxy })
    return proxy as P
}

type DelegateFunction<F> = F extends (...args: any) => any ? F : never
type PickMatching<T, V> =
    { [K in keyof T as T[K] extends V ? K : never]: T[K] }
type OnlyFunctionKeys<P extends object> = keyof PickMatching<P, (...args: any) => any>
type DelegateFunctionArg<P> = P extends (...args: infer A) => any ? A : any
type DelegateFunctionRes<P> = P extends (...args: any) => infer R ? R : any


export const delegate = <P extends object, K extends OnlyFunctionKeys<P> = OnlyFunctionKeys<P>>(id: K, options: { delegatorName?: string } = {}): DelegateFunction<P[K]> => {
    const { delegatorName = DELEGATOR_NAME } = options

    type Args = DelegateFunctionArg<P[K]>
    type Res = DelegateFunctionRes<P[K]>

    const delegateMethod = function (this: any, ...args: Args): Res {
        return this[delegatorName][id](...args)
    }

    return delegateMethod as DelegateFunction<P[K]>
}
