import type { Lazy } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq
declare.test("should type as Lazy<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).find(() => true))).to_equal(type<Lazy<number | undefined>>)
})
declare.test("should type as Lazy<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).find(() => true, "alt" as string))).to_equal(
        type<Lazy<number | string>>
    )
})
declare.test("should type as Lazy<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).find(() => true, "alt"))).to_equal(type<Lazy<number | "alt">>)
})
it("returns undefined for empty", () => {
    const s = _seq([]).find(() => true)
    expect(s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", () => {
    const s = _seq([1, 2, 3]).find(() => false)
    expect(s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", () => {
    const s = _seq([1, 2, 3]).find(() => false, "alt")
    expect(s.pull()).toEqual("alt")
})

it("returns first match", () => {
    const s = _seq([1, 2, 3]).find(() => true)
    expect(s.pull()).toEqual(1)
})

it("returns match even with alt", () => {
    const s = _seq([1, 2, 3]).find(() => true, "alt")
    expect(s.pull()).toEqual(1)
})

it("returns match even if not first", () => {
    const s = _seq([1, 2, 3]).find(x => x === 3, "alt")
    expect(s.pull()).toEqual(3)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.find(() => true)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", () => {
    const sq = jest.fn(function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).find(() => true)
    expect(sq).not.toHaveBeenCalled()
    tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).find(fn)
    s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})
