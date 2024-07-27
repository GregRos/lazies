import { isAsyncIterable, isIterable, isNextable } from "stdlazy"
import type { ASeqLikeInput, SeqLikeInput } from "../f-types"
import { ASeq } from "../seq/aseq.class"
import { Seq } from "../seq/seq.class"

class FromAsyncInput<T> extends ASeq<T> {
    constructor(private readonly _input: ASeqLikeInput<T>) {
        super()
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T, any, undefined> {
        const items = await this._input
        if (isAsyncIterable(items)) {
            yield* items
        } else if (isIterable(items)) {
            yield* items
        } else if (typeof items === "function") {
            const result = items()
            if (isAsyncIterable(result)) {
                yield* result
            } else if (isIterable(result)) {
                yield* result
            } else if (isNextable(result)) {
                for (let item = await result.next(); !item.done; item = await result.next()) {
                    yield item.value
                }
            } else {
                throw new Error(`Got unexpected result from iterator constructor: ${result}`)
            }
        }
    }
}

class FromSyncInput<T> extends Seq<T> {
    constructor(private readonly _input: SeqLikeInput<T>) {
        super()
    }

    *[Symbol.iterator](): Iterator<T, any, undefined> {
        const input = this._input
        if (typeof input === "function") {
            const result = input()
            if (isIterable(result)) {
                yield* result
            } else {
                for (;;) {
                    const { done, value } = result.next()
                    if (done) {
                        return
                    }
                    yield value
                }
            }
        } else {
            yield* input
        }
    }
}
export function fromSyncInput<In>(input: SeqLikeInput<In>): Seq<In> {
    if (input instanceof Seq) {
        return input
    }
    return new FromSyncInput(input)
}
export function fromAsyncInput<In>(input: ASeqLikeInput<In>): ASeq<In> {
    if (input instanceof ASeq) {
        return input
    }
    return new FromAsyncInput(input)
}