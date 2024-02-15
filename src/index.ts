import {DelegateFunctionRes, DelegateFunctionArg, OnlyFunctionKeys, DelegateFunction} from './types'

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

export const delegate = <P extends object, K extends OnlyFunctionKeys<P> = OnlyFunctionKeys<P>>(id: K, options: { delegatorName?: string } = {}): DelegateFunction<P[K]> => {
    const { delegatorName = DELEGATOR_NAME } = options

    type Args = DelegateFunctionArg<P[K]>
    type Res = DelegateFunctionRes<P[K]>

    const delegateMethod = function (this: any, ...args: Args): Res {
        return this[delegatorName][id](...args)
    }

    return delegateMethod as DelegateFunction<P[K]>
}
