import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
type _ASeq<T> = ASeq<T>

declare.it("returns aseq of same type", expect => {
    const s = _seq([1, 2, 3]).orderBy(() => 1)
    expect(type_of(s)).to_equal(type<_ASeq<number>>)
})

it("returns empty on empty", async () => {
    const s = _seq([]).orderBy(() => 1)
    expect(await s._qr).toEqual([])
})

it("returns singleton on singleton", async () => {
    const s = _seq([1]).orderBy(() => 1)
    expect(await s._qr).toEqual([1])
})

it("doesn't change order for same key", async () => {
    const s = _seq([1, 2, 1, 2]).orderBy(() => 1)
    expect(await s._qr).toEqual([1, 2, 1, 2])
})

it("sorted input", async () => {
    const s = _seq([1, 2, 3]).orderBy(x => x)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("unsorted input", async () => {
    const s = _seq([3, 1, 2]).orderBy(x => x)
    expect(await s._qr).toEqual([1, 2, 3])
})

it("input with duplicates", async () => {
    const s = _seq([1, 2, 1, 2]).orderBy(x => x)
    expect(await s._qr).toEqual([1, 1, 2, 2])
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const input = _seq(fn)
    const result = input.orderBy(x => x)
    expect(fn).not.toHaveBeenCalled()
    for await (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls, calls iteratee as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const map = jest.fn(x => x)
    const tkw = _seq(sq).orderBy(map)
    expect(sq).not.toHaveBeenCalled()
    expect(map).not.toHaveBeenCalled()
    for await (const _ of tkw) {
    }
    expect(map).toHaveBeenCalledTimes(3)
    expect(sq).toHaveBeenCalledTimes(1)
})
it("reverse = true gives descending order", async () => {
    const s = _seq([1, 2, 3]).orderBy(x => x, true)
    await expect(s._qr).resolves.toEqual([3, 2, 1])
})
it("doesn't throw for incomparable key", async () => {
    await expect(
        _seq([null, undefined, NaN, {}, []])
            .orderBy(x => x)
            .toArray()
            .pull()
    ).resolves.not.toThrow()
})
