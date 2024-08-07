import { checkPredicate } from "../../errors/error.js"
import type { Lazy, LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../lazy-operator.js"
import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import type { Seq } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"
const NO_MATCH = Symbol("NO_MATCH")
function generic<T>(input: Seq<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    checkPredicate(predicate)
    return lazyFromOperator(input, function some(input) {
        return input
            .find(predicate, NO_MATCH)
            .map(x => x !== NO_MATCH)
            .pull()
    })
}

export function sync<T>(this: Iterable<T>, predicate: Seq.Predicate<T>): Lazy<boolean> {
    return generic(seq(this), predicate)
}
export function async<T>(this: AsyncIterable<T>, predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
    return generic(aseq(this) as any, predicate as any) as any
}
