import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

import { checkHandler } from "../../errors/error.js"
import { _aiter, _iter, isThenable } from "../../utils.js"
import { seq } from "../seq/seq.js"

class ThrewNonError<T> extends Error {
    constructor(public value: T) {
        super(`An iterable threw a non-error value of type ${typeof value}: ${value}`)
    }
}

export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<Error, Seq.Input<S>>
): Seq<T | S>
export function sync<T>(this: Iterable<T>, handler: Seq.Iteratee<Error, void | undefined>): Seq<T>
export function sync<T, S>(
    this: Iterable<T>,
    handler: Seq.Iteratee<Error, void | Seq.Input<S>>
): Seq<unknown> {
    checkHandler(handler)
    return SeqOperator(this, function* catch_(input) {
        let i = 0
        const iterator = _iter(input)
        for (;;) {
            try {
                const result = iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                let error = err
                if (typeof error !== "object" || !(error instanceof Error)) {
                    error = new ThrewNonError(error)
                }
                const result = handler(error, i)
                if (!result || result == null) {
                    return
                }
                if (isThenable(result)) {
                    throw TypeError(
                        "Unexpected promise or thenable returned from sync catch handler."
                    )
                }
                yield* seq(result)
                return
            }
            i++
        }
    })
}

export function async<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<Error, ASeq.SimpleInput<S>>
): ASeq<T | S>
export function async<T>(this: AsyncIterable<T>, handler: ASeq.Iteratee<Error, void>): ASeq<T>
export function async<T, S>(
    this: AsyncIterable<T>,
    handler: ASeq.Iteratee<Error, void | ASeq.SimpleInput<S>>
): ASeq<any> {
    checkHandler(handler)
    return ASeqOperator(this, async function* catch_(input) {
        let i = 0
        const iterator = _aiter(input)
        for (;;) {
            try {
                const result = await iterator.next()
                var value = result.value
                if (result.done) {
                    return
                }
                yield value
            } catch (err: any) {
                let error = err
                if (typeof error !== "object" || !(error instanceof Error)) {
                    error = new ThrewNonError(error)
                }
                const result = await handler(error, i)
                if (!result || result == null) {
                    return
                }
                yield* aseq(result)
                return
            }
            i++
        }
    })
}
