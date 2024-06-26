import { aseq } from "@lib"

// Tests for Seq.toMap
it("should give empty map on empty", async () => {
    const s = aseq().toMap(x => [x, x])
    expect(await s.pull()).toEqual(new Map<never, never>())
})

it("should convert to map", async () => {
    const s = aseq.of(1, 2, 3).toMap(x => [x, x])
    expect(await s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("should convert to map with different keys", async () => {
    const s = aseq.of(1, 2, 3).toMap(x => [x + 1, x])
    expect(await s.pull()).toEqual(
        new Map([
            [2, 1],
            [3, 2],
            [4, 3]
        ])
    )
})

it("should replace old key on conflicting", async () => {
    const s = aseq.of(1, 2, 3).toMap(x => [x % 2, x])
    expect(await s.pull()).toEqual(
        new Map([
            [0, 2],
            [1, 3]
        ])
    )
})
