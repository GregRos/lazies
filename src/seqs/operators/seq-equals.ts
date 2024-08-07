import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { _aiter, _iter } from "../../utils.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { Seq } from "../seq/seq.class.js"
import { seq } from "../seq/seq.js"

export function sync<T extends S, S>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>): Lazy<boolean>
export function sync<T, S extends T>(this: Iterable<T>, _other: Seq.Input<S>) {
    const other = seq(_other)
    return lazyFromOperator(this, function seqEquals(input) {
        const otherIterator = _iter(other)
        for (const element of input) {
            const otherElement = otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return !!otherIterator.next().done
    })
}

export function async<T extends S, S>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
export function async<T, S extends T>(
    this: AsyncIterable<T>,
    _other: ASeq.SimpleInput<S>
): LazyAsync<boolean>
export function async<T>(this: AsyncIterable<T>, _other: ASeq.SimpleInput<T>) {
    const other = aseq(_other)
    return lazyFromOperator(this, async function seqEquals(input) {
        const otherIterator = _aiter(other)
        for await (const element of input) {
            const otherElement = await otherIterator.next()
            if (otherElement.done || element !== otherElement.value) {
                return false
            }
        }
        return !!(await otherIterator.next()).done
    })
}
