import { declare, type, type_of } from "declare-it"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

const f = aseq
type SType<T> = ASeq<T>
describe("0 arguments", () => {
    declare.test("type stays never", expect => {
        const sNever = f().append()
        expect(type_of(sNever)).to_equal(type<SType<never>>)
        const sNumber = f<number>().append()
        expect(type_of(sNumber)).to_equal(type<SType<number>>)
    })
    it("stays empty", async () => {
        const s = f().append()
        expect(await s._qr).toEqual([])
    })
    it("stays with same elements", async () => {
        const s = f([1, 2, 3]).append()
        expect(await s._qr).toEqual([1, 2, 3])
    })
})
describe("1 argument", () => {
    declare.test("disjunction with input type", expect => {
        const s = f(["a", "b"]).append(1)
        expect(type_of(s)).to_equal(type<SType<string | number>>)
    })
    declare.test("2 input types create disjunction", expect => {
        const s = f(["a", "b"]).append(1, true)
        expect(type_of(s)).to_equal(type<SType<string | number | boolean>>)
    })
    it("appends one element", async () => {
        const s = f([1, 2, 3]).append(4)
        await expect(s._qr).resolves.toEqual([1, 2, 3, 4])
    })
    it("appends one element to empty", async () => {
        const s = f().append(4)
        await expect(s._qr).resolves.toEqual([4])
    })
    it("appends to infinite passes", async () => {
        const s = f.repeat(Infinity, 1).append(2)
        await expect(s.take(3)._qr).resolves.toEqual([1, 1, 1])
    })
})

it("can iterate twice", async () => {
    const s = f([1, 2, 3]).append(4)
    await expect(s._qr).resolves.toEqual([1, 2, 3, 4])
    await expect(s._qr).resolves.toEqual([1, 2, 3, 4])
})