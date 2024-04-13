import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should perform scan operation", async () => {
    const s = aseqs.of(1, 2, 3, 4, 5)
    const result = await s
        .scan(async (acc, x) => acc + x, 0)
        .toArray()
        .pull()
    expect(result).toBeEqual([1, 3, 6, 10, 15])
})

it("should return empty sequence for empty input", async () => {
    const s = aseqs.empty<number>()
    const result = await s
        .scan(async (acc, x) => acc + x, 0)
        .toArray()
        .pull()
    expect(result).toBeEqual([])
})
