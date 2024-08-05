import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../.."
import type { ASeq } from "../.."
import { aseq } from "../.."

const f = aseq
type SType<T> = ASeq<T>

declare.test("should type as LazyAsync<boolean>", expect => {
    expect(type_of(f([1, 2, 3]).some(() => true))).to_equal(type<LazyAsync<boolean>>)
})

it("returns false for empty", async () => {
    const s = f([]).some(() => true)
    expect(await s.pull()).toEqual(false)
})

it("works for async predicates (true)", async () => {
    const s = f([1, 2, 3]).some(async x => x === 2)
    expect(await s.pull()).toEqual(true)
})

it("works for async predicates (false)", async () => {
    const s = f([1, 2, 3]).some(async x => x === 4)
    expect(await s.pull()).toEqual(false)
})
it("returns false for no matches", async () => {
    const s = f([1, 2, 3]).some(() => false)
    expect(await s.pull()).toEqual(false)
})

it("returns true for at least one match", async () => {
    const s = f([1, 2, 3]).some(x => x === 2)
    expect(await s.pull()).toEqual(true)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = f(fn)
    const lazy = s.some(() => true)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed when true", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(true).toBe(true)
    })
    const tkw = f(sq).some(() => true)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate until first match found", async () => {
    const fn = jest.fn(x => x > 1)
    const s = f([1, 2, 3]).some(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("works with async predicate (true)", async () => {
    const s = f([1, 2, 3]).some(async x => true)
    expect(await s.pull()).toEqual(true)
})

it("works with async predicate (false)", async () => {
    const s = f([1, 2, 3]).some(async x => false)
    expect(await s.pull()).toEqual(false)
})
