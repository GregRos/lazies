import { aseq } from "@lib"

it("should filter prototypes", async () => {
    const stuffs = aseq.of(1, new Map(), new Set())
    const filtered = stuffs.extractTypes(Map)
    expect(await filtered.toArray().pull()).toEqual([new Map()])
})

it("should do nothing on empty", async () => {
    const stuffs = aseq.empty().extractTypes(Map)
    expect(await stuffs.some().pull()).toBe(false)
})

it("should work with Number objects", () => {})
