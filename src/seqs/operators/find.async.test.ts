import type { LazyAsync } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
declare.test("should type as LazyAsync<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).find(() => true))).to_equal(type<LazyAsync<number | undefined>>)
})
declare.test("should type as LazyAsync<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).find(() => true, "alt" as string))).to_equal(
        type<LazyAsync<number | string>>
    )
})
declare.test("should type as LazyAsync<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).find(() => true, "alt"))).to_equal(
        type<LazyAsync<number | "alt">>
    )
})
it("returns undefined for empty", async () => {
    const s = _seq([]).find(() => true)
    expect(await s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", async () => {
    const s = _seq([1, 2, 3]).find(() => false)
    expect(await s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", async () => {
    const s = _seq([1, 2, 3]).find(() => false, "alt")
    expect(await s.pull()).toEqual("alt")
})

it("returns first match", async () => {
    const s = _seq([1, 2, 3]).find(() => true)
    expect(await s.pull()).toEqual(1)
})

it("returns match even with alt", async () => {
    const s = _seq([1, 2, 3]).find(() => true, "alt")
    expect(await s.pull()).toEqual(1)
})

it("returns match even if not first", async () => {
    const s = _seq([1, 2, 3]).find(x => x === 3, "alt")
    expect(await s.pull()).toEqual(3)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const lazy = s.find(() => true)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).find(() => true)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", async () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).find(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works for async predicates (true)", async () => {
    const s = _seq([1, 2, 3]).find(async x => x === 2)
    expect(await s.pull()).toEqual(2)
})

it("works for async predicates (false)", async () => {
    const s = _seq([1, 2, 3]).find(async x => x === 4)
    expect(await s.pull()).toEqual(undefined)
})
