import { mustBePositiveInt } from "../../errors/error"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"
import type {
    getReturnedWindowType,
    getWindowProjectionArgsType
} from "../type-functions/get-window-type"

export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection: (...window: getWindowProjectionArgsType<T, L>) => S
): Seq<S>
export function sync<T, L extends number>(
    this: Iterable<T>,
    size: L
): Seq<getReturnedWindowType<T, L>>
export function sync<T, L extends number, S>(
    this: Iterable<T>,
    size: L,
    projection?: (...window: getWindowProjectionArgsType<T, L>) => S
): Seq<any> {
    mustBePositiveInt("windowSize", size)
    projection ??= (...window: any) => window as any
    return new syncOperator("window", this, function* (input) {
        const buffer = Array<T>(size)
        let i = 0
        for (const item of input) {
            buffer[i++ % size] = item
            if (i >= size) {
                yield (projection as any).call(
                    null,
                    ...buffer.slice(i % size),
                    ...buffer.slice(0, i % size)
                )
            }
        }
        if (i > 0 && i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}
export function async<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection: (...window: getWindowProjectionArgsType<T, L>) => S
): ASeq<S>
export function async<T, L extends number>(
    this: AsyncIterable<T>,
    size: L
): ASeq<getReturnedWindowType<T, L>>
export function async<T, L extends number, S>(
    this: AsyncIterable<T>,
    size: L,
    projection?: (...window: getWindowProjectionArgsType<T, L>) => S
): ASeq<any> {
    mustBePositiveInt("windowSize", size)
    projection ??= (...window: any) => window as any
    return new asyncOperator("window", this, async function* (input) {
        const buffer = Array<T>(size)
        let i = 0
        for await (const item of input) {
            buffer[i++ % size] = item
            if (i >= size) {
                yield (projection as any).call(
                    null,
                    ...buffer.slice(i % size),
                    ...buffer.slice(0, i % size)
                )
            }
        }

        if (i > 0 && i < size) {
            yield (projection as any).call(null, ...buffer.slice(0, i))
        }
    })
}