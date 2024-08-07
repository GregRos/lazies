import { isThenable } from "../../utils.js"
import type { Lazy, LazyAsync } from "../lazy.js"
import { lazy } from "../lazy.js"

/**
 * Zips **this** {@link Lazy} primitive with one or more others, returning a new {@link Lazy} that,
 * when pulled, will pull all of them and return an array with the results. If any primitive
 * involved is async, the new {@link Lazy} will also be async.
 *
 * @example
 *     const a = lazy(() => 1).zip(lazy(() => 2)) satisfies Lazy<[number, number]>
 *     expect(a.pull()).toEqual([1, 2])
 *
 *     const b = lazy(async () => 1).zip(lazy(() => 2)) satisfies LazyAsync<[number, number]>
 *     await expect(b.pull()).resolves.toEqual([1, 2])
 *
 * @param others One or more {@link Lazy} primitives to zip with **this**.
 * @summary Turns multiple lazy values into a single lazy value producing an array.
 */
function zip<T, Others extends readonly [Lazy<any>, ...Lazy<any>[]]>(
    this: Lazy<T>,
    ...others: Others
): LazyAsync<any> extends [Lazy<T>, ...Others][number]
    ? LazyAsync<
          [
              Lazy.PulledAwaited<T>,
              ...{
                  [K in keyof Others]: Lazy.PulledAwaited<Others[K]>
              }
          ]
      >
    : Lazy<
          [
              Lazy.Pulled<T>,
              ...{
                  [K in keyof Others]: Lazy.Pulled<Others[K]>
              }
          ]
      >

function zip(this: Lazy<any>, ...others: Lazy<any>[]): Lazy<any> {
    return lazy(() => {
        const values = [this, ...others].map(x => x.pull())
        if (values.some(isThenable)) {
            return Promise.all(values)
        }
        return values
    })
}

export default zip
