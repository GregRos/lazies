import { lazy } from "./ctor"
import { cannotRecurseSync } from "./errors"
import { LazyInfo } from "./types"
import {
    LazyAsync,
    LazyInitializer,
    LazyLike,
    Pulled,
    PulledAwaited,
    getClassName,
    getInitializerName,
    isPullable,
    isThenable
} from "./types"

export const methodName = Symbol("methodName")
export const ownerInstance = Symbol("ownerInstance")

/**
 * A simple, debuggable, and strongly-typed lazy value that works in both synchronous and
 * asynchronous contexts.
 *
 * To force the evaluation of a lazy value, call the {@link pull} method. This will execute the
 * initializer function and cache the result for future calls.
 *
 * Nestings of {@link Lazy} and {@link Promise} will be flattened, so that the {@link pull} method will
 * never return another {@link Lazy} or an irregular nesting of {@link Promise}.
 */
export class Lazy<T> implements LazyLike<T> {
    /** The cached value or error, stored from a previous execution of the initializer. */
    private _cached?: any
    private _desc: string
    private _info: LazyInfo
    get info(): Readonly<LazyInfo> {
        return this._info
    }
    /**
     * The initializer function that will be called to construct the value. It will be cleared after
     * the value is constructed.
     */
    private _init?: LazyInitializer<T>
    /** Has the initializer finished executing? */
    get isReady() {
        return this._info.stage === "ready"
    }

    private constructor(initializer: LazyInitializer<T>) {
        this._info = {
            stage: "pending",
            syncness: "pending",
            name: getInitializerName(initializer)
        }
        this._desc = this._makeDescription()
        this._init = initializer

        const anyMe = this as any
        for (const key of ["pull", "map", "do", "zip", "assemble"]) {
            anyMe[key] = anyMe[key].bind(this)
            anyMe[key][ownerInstance] = this
            anyMe[key][methodName] = key
        }
    }

    static create<T>(initializer: () => T | Lazy<T>): Lazy<T> {
        const asAny = initializer as any
        if (asAny[ownerInstance] && asAny[methodName] === "pull") {
            return asAny[ownerInstance]
        }
        return new Lazy(initializer) as any
    }

    private _makeDescription(resolved?: any) {
        const asyncPart = this._info.syncness === "pending" ? [] : [this._info.syncness]
        const stagePart =
            this._info.stage === "ready" ? getClassName(resolved) : `<${this._info.stage}>`
        const name = this._info.name ? `lazy(${this._info.name})` : "lazy"
        return [name, ...asyncPart, stagePart].join(" ")
    }

    /** Returns a short description of the Lazy value and its state. */
    toString() {
        return this._desc
    }

    /**
     * Pulls **this** {@link Lazy} value, executing the initializer function if it hasn't been
     * called. If the initializer is async, it will return a {@link Promise}.
     *
     * @returns The value produced by the initializer, after flattening any nested {@link Lazy} or
     *   {@link Promise} instances.
     * @throws The error thrown during initialization, if any.
     */
    pull(): Pulled<T> {
        const info = this._info
        if (info.stage === "failed") {
            // Correct way to return the error
            throw this._cached
        }
        if (info.stage === "pulled") {
            if (info.syncness === "async") {
                return this._cached
            } else {
                throw cannotRecurseSync()
            }
        }
        if (info.stage === "ready") {
            return this._cached!
        }
        info.stage = "pulled"
        this._desc = this._makeDescription()
        let resource: any
        try {
            const result = this._init!()
            resource = isPullable(result) ? result.pull() : result
        } catch (e) {
            this._cached = e
            info.stage = "failed"
            this._desc = this._makeDescription()
            throw e
        }
        // No need to keep holding a reference to the constructor.
        this._init = undefined

        if (isThenable(resource)) {
            info.syncness = "async"
            resource = resource.then(value => {
                if (isPullable(value)) {
                    value = value.pull()
                }
                info.stage = "ready"
                this._desc = this._makeDescription(value)
                return value
            })
        } else {
            info.syncness = "sync"
            info.stage = "ready"
        }
        this._cached = resource
        this._desc = this._makeDescription()

        return resource
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }

    /**
     * Creates a new {@link Lazy} primitive that, when pulled, will pull **this** and return its
     * result, projected using the given function. If the Lazy primitive is async, the projection
     * function will receive the awaited value.
     *
     * This method is strongly typed and will return a {@link Lazy} or {@link LazyAsync} instance
     * based on both the return type of the projection function and the syncness of **this**.
     *
     * @example
     *     // sync projectionL
     *     const sync = lazy(() => "hello").map(x => `${x} world`) satisfies Lazy<string>
     *     expect(sync.pull()).toBe("hello world")
     *
     *     // sync projection on async lazy:
     *     const async = lazy(async () => [1]).map(x => [...x, 2]) satisfies LazyAsync<number[]>
     *     await expect(async.pull()).resolves.toBe(2)
     *
     *     // async projection on sync lazy:
     *     const nested = lazy(() => 1).map(async x => x + 1) satisfies LazyAsync<number>
     *     await expect(nested.pull()).resolves.toBe(2)
     *
     *     // async projection on async lazy:
     *     const asyncToAsync = lazy(async () => 1).map(
     *         async x => x + 1
     *     ) satisfies LazyAsync<number>
     *     await expect(asyncToAsync.pull()).resolves.toBe(2)
     *
     * @param projection The function to apply to the value of the Lazy primitive. It will flatten
     *   any nested {@link Lazy} and {@link Promise} instances.
     * @summary
     * Projects the result of this {@link Lazy} primitive using the given function.
     * @see {@link Array.map} for a similar method on arrays.
     * @see {@link Promise.then} for a similar method on promises.
     * @see {@link Lazy.do} for a similar method that doesn't change the result.
     */
    map<S, R>(
        this: LazyAsync<S>,
        projection: (value: PulledAwaited<S>) => Promise<LazyAsync<R>>
    ): LazyAsync<R>
    map<S, Y>(
        this: LazyAsync<S>,
        projection: (value: PulledAwaited<S>) => Promise<LazyAsync<Y>>
    ): LazyAsync<Y>
    map<S, X>(
        this: LazyAsync<S>,
        projection: (value: PulledAwaited<S>) => Promise<Lazy<X>>
    ): LazyAsync<X>
    map<S, X>(this: LazyAsync<S>, projection: (value: PulledAwaited<S>) => Promise<X>): LazyAsync<X>
    map<S, X>(
        this: LazyAsync<S>,
        projection: (value: PulledAwaited<S>) => LazyAsync<X>
    ): LazyAsync<X>
    map<S, R>(this: LazyAsync<S>, f: (value: PulledAwaited<S>) => Lazy<R>): LazyAsync<R>
    map<S, R>(this: LazyAsync<S>, f: (value: PulledAwaited<S>) => R): LazyAsync<R>
    map<Y>(projection: (value: PulledAwaited<T>) => Promise<LazyAsync<Y>>): LazyAsync<Y>
    map<X>(projection: (value: PulledAwaited<T>) => Promise<Lazy<X>>): LazyAsync<X>
    map<X>(projection: (value: PulledAwaited<T>) => Promise<X>): LazyAsync<X>
    map<R>(projection: (value: PulledAwaited<T>) => Lazy<R>): Lazy<R>
    map<R>(projection: (value: PulledAwaited<T>) => R): Lazy<R>

    map(this: Lazy<any>, projection: (a: any) => any): any {
        return lazy(() => {
            const pulled = this.pull()
            if (isThenable(pulled)) {
                return pulled.then(projection)
            }
            return projection(pulled)
        })
    }

    /**
     * Creates a new {@link Lazy} primitive that, when pulled, will pull **this** and apply the given
     * callback to the result. The new {@link Lazy} will still return the same value as **this**,
     * only waiting for the handler to finish first.
     *
     * If the handler returns a {@link Lazy} or a {@link Promise}, the new {@link Lazy} will pull or
     * await it before returning the same value as **this**.
     *
     * @example
     *     const lazy = lazy(() => 1).do(x => console.log(x)) satisfies Lazy<number>
     *     expect(lazy.pull()).toBe(1) // Logs "1" to the console as a side effect.
     *     const wait30 = lazy(() => 1).do(
     *         async x => new Promise(r => setTimeout(r, 30))
     *     ) satisfies Lazy<number>
     *     await expect(wait30.pull()).resolves.toBe(1) // Waits 30ms before returning 1.
     *
     * @param callback The callback
     * @summary Applies the given callback to the result of this {@link Lazy} primitive.
     */
    do<S>(
        this: LazyAsync<S>,
        callback: (
            value: S
        ) => any | Lazy<any> | Promise<any> | Promise<LazyAsync<any>> | LazyAsync<any>
    ): LazyAsync<S>
    do<T>(
        this: Lazy<T>,
        callback: (value: PulledAwaited<T>) => Promise<any> | LazyAsync<any>
    ): LazyAsync<T>
    do<T>(this: Lazy<T>, callback: (value: PulledAwaited<T>) => Lazy<any>): Lazy<T>
    do<T>(this: Lazy<T>, callback: (value: PulledAwaited<T>) => any): Lazy<T>
    do<T>(this: LazyAsync<T>, callback: (value: any) => any): any {
        return this.map(x => {
            const result = callback(x)
            return lazy(() => {
                return result
            }).map(() => x)
        })
    }

    /**
     * Zips **this** {@link Lazy} primitive with one or more others, returning a new {@link Lazy}
     * that, when pulled, will pull all of them and return an array with the results. If any
     * primitive involved is async, the new {@link Lazy} will also be async.
     *
     * @example
     *     const a = lazy(() => 1).zip(lazy(() => 2)) satisfies Lazy<[number, number]>
     *     expect(a.pull()).toBeEqual([1, 2])
     *
     *     const b = lazy(async () => 1).zip(lazy(() => 2)) satisfies LazyAsync<[number, number]>
     *     await expect(b.pull()).resolves.toBeEqual([1, 2])
     *
     * @param others One or more {@link Lazy} primitives to zip with **this**.
     * @summary Turns multiple lazy values into a single lazy value producing an array.
     */
    zip<Others extends readonly [LazyLike<unknown>, ...LazyLike<unknown>[]]>(
        ...others: Others
    ): LazyAsync<any> extends [this, ...Others][number]
        ? LazyAsync<
              [
                  PulledAwaited<T>,
                  ...{
                      [K in keyof Others]: PulledAwaited<Others[K]>
                  }
              ]
          >
        : Lazy<
              [
                  Pulled<T>,
                  ...{
                      [K in keyof Others]: Pulled<Others[K]>
                  }
              ]
          >

    zip(...others: LazyLike<any>[]): Lazy<any> {
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        return lazy(() => {
            const values = [this, ...others].map(x => x.pull())
            if (values.some(isThenable)) {
                return Promise.all(values)
            }
            return values
        })
    }

    /**
     * Takes an key-value object with {@link Lazy} values and returns a new {@link Lazy} that, when
     * pulled, will pull all of them and return an object with the same keys, but with the values
     * replaced by the pulled results. If any of the values are async, the new {@link Lazy} will also
     * be async.
     *
     * The value of **this** {@link Lazy} will be available under the key `"this"`.
     *
     * @example
     *     const self = lazy(() => 1).assemble({
     *         a: lazy(() => 2),
     *         b: lazy(() => 3)
     *     })
     *     expect(self.pull()).toBeEqual({ this: 1, a: 2, b: 3 })
     *
     *     const asyncSelf = lazy(async () => 1).assemble({
     *         a: lazy(() => 2),
     *         b: lazy(() => 3)
     *     })
     *     await expect(asyncSelf.pull()).resolves.toBeEqual({ this: 1, a: 2, b: 3 })
     *
     * @param assembly An object with {@link Lazy} values.
     * @returns A new {@link Lazy} primitive that will return an object with the same keys as the
     *   input object, plus the key `"this"`, with the pulled results.
     * @summary Converts an object of {@link Lazy} values into a {@link Lazy} value producing an object.
     */
    assemble<X extends Record<keyof X, LazyLike<unknown>>>(
        assembly: X
    ): LazyAsync<any> extends X[keyof X] | this
        ? LazyAsync<
              {
                  [K in keyof X]: PulledAwaited<X[K]>
              } & {
                  this: PulledAwaited<T>
              }
          >
        : Lazy<
              {
                  [K in keyof X]: Pulled<X[K]>
              } & {
                  this: Pulled<T>
              }
          > {
        return lazy(() => {
            const keys = ["this", ...Object.keys(assembly)]
            const values = [this, ...Object.values(assembly)].map((x: any) => x.pull())
            if (values.some(isThenable)) {
                return Promise.all(values).then(values =>
                    keys.reduce((acc, key, i) => {
                        acc[key] = values[i]
                        return acc
                    }, {} as any)
                )
            }
            return values.reduce((acc, value, i) => {
                acc[keys[i]] = value
                return acc
            }, {} as any)
        }) as any
    }
}