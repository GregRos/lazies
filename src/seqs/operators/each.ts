import { checkAction, parseStage } from "../../errors/error.js"
import { Stage } from "../../utils.js"
import { ASeqOperator, type ASeq } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
export type EachCallStage = "before" | "after" | "both" | undefined
export function sync<T>(
    this: Iterable<T>,
    action: Seq.StageIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    checkAction(action)
    const myStage = parseStage(stage)
    return SeqOperator(this, function* each(input) {
        let index = 0
        for (const element of input) {
            if (myStage & Stage.Before) {
                action(element, index, "before")
            }
            yield element
            if (myStage & Stage.After) {
                action(element, index, "after")
            }
            index++
        }
    })
}
export function async<T>(
    this: AsyncIterable<T>,
    action: ASeq.StageIteratee<T, void>,
    stage: EachCallStage = "before"
) {
    checkAction(action)
    const myStage = parseStage(stage)
    return ASeqOperator(this, async function* each(input) {
        let index = 0
        for await (const element of input) {
            if (myStage & Stage.Before) {
                await action(element, index, "before")
            }
            yield element
            if (myStage & Stage.After) {
                await action(element, index, "after")
            }
            index++
        }
    })
}
