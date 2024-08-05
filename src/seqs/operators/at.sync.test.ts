import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../.."
import type { Seq } from "../.."

import { seq } from "../.."
const _seq = seq
type SType<T> = Seq<T>
declare.test("correctly typed as Lazy and disjunction with undefined", expect => {
    const s = _seq([1, 2, 3]).at(0)
    expect(type_of(s)).to_equal(type<Lazy<number | undefined>>)
})

it("gets first element", () => {
    const s = _seq([1, 2, 3]).at(0)
    expect(s.pull()).toEqual(1)
})

it("gets last element", () => {
    const s = _seq([1, 2, 3]).at(2)
    expect(s.pull()).toEqual(3)
})

it("gets undefined for out of bounds", () => {
    const s = _seq([1, 2, 3]).at(3)
    expect(s.pull()).toEqual(undefined)
})

it("gets last item for negative index", () => {
    const s = _seq([1, 2, 3]).at(-1)
    expect(s.pull()).toEqual(3)
})

it("gets first item for negative index", () => {
    const s = _seq([1, 2, 3]).at(-3)
    expect(s.pull()).toEqual(1)
})

it("has no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.at(0)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

describe("invalid inputs", () => {
    describe("throws on invocation", () => {
        it("non-number index", () => {
            // @ts-expect-error
            expect(() => _seq([1, 2, 3]).at("0")).toThrow()
        })

        it("non-integer index", () => {
            expect(() => _seq([1, 2, 3]).at(0.5)).toThrow()
            expect(() => _seq([1, 2, 3]).at(NaN)).toThrow()
            expect(() => _seq([1, 2, 3]).at(Infinity)).toThrow()
            expect(() => _seq([1, 2, 3]).at(-Infinity)).toThrow()
        })

        it("bigint index", () => {
            // @ts-expect-error
            expect(() => _seq([1, 2, 3]).at(0n)).toThrow()
        })
    })
})
