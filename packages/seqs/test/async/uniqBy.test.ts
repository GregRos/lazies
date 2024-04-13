it("should return unique elements based on key function", async () => {
    const s = aseqs.of(
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 1, name: "John" },
        { id: 3, name: "Alice" }
    )
    const result = await s
        .uniqBy(async x => x.id)
        .toArray()
        .pull()
    expect(result).toBeEqual([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Alice" }
    ])
})

it("should return empty sequence for empty input", async () => {
    const s = aseqs.empty<{ id: number; name: string }>()
    const result = await s
        .uniqBy(async x => x.id)
        .toArray()
        .pull()
    expect(result).toBeEqual([])
})
