import { aseq } from "@lib"

describe("no predicate", () => {
    it("gives false if empty", async () => {
        expect(await aseq.empty<number>().some().pull()).toEqual(false)
    })

    it("gives true if single element", async () => {
        expect(await aseq.of(1).some().pull()).toEqual(true)
    })
})

describe("predicate", () => {
    it("gives false if empty", async () => {
        expect(
            await aseq
                .empty<number>()
                .some(async () => true)
                .pull()
        ).toEqual(false)
    })

    it("gives true if single element", async () => {
        expect(
            await aseq
                .of(1)
                .some(async () => true)
                .pull()
        ).toEqual(true)
    })

    it("gives false if predicate is false", async () => {
        expect(
            await aseq
                .of(1)
                .some(async () => false)
                .pull()
        ).toEqual(false)
    })

    it("gives true if predicate is true", async () => {
        expect(
            await aseq
                .of(1)
                .some(async () => true)
                .pull()
        ).toEqual(true)
    })

    it("gives true if predicate is true for some", async () => {
        expect(
            await aseq
                .of(1, 2, 3)
                .some(async v => v === 2)
                .pull()
        ).toEqual(true)
    })

    it("gives false if predicate is false for all", async () => {
        expect(
            await aseq
                .of(1, 2, 3)
                .some(async v => v === 4)
                .pull()
        ).toEqual(false)
    })
})
