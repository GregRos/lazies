import { SeqLike } from "../sync/types"
import { ASeq } from "./async-wrapper"
export type MaybePromise<T> = T | Promise<T>
export type AsyncIteratee<E, O> = (this: ASeq<E>, element: E, index: number) => MaybePromise<O>
export type AsyncPredicate<E> = AsyncIteratee<E, boolean>
export type AsyncReducer<E, O> = (
    this: ASeq<E>,
    acc: O,
    element: E,
    index: number
) => MaybePromise<O>
export type ASeqLike<E> = ASeq<E> | AsyncIterable<E> | (() => AsyncIterable<E> | AsyncIterator<E>)
export type AnySeqLike<E> = ASeqLike<E> | SeqLike<E>
export type AnyPromisedSeqLike<E> =
    | AnySeqLike<E>
    | AnySeqLike<PromiseLike<E>>
    | PromiseLike<AnySeqLike<E>>
