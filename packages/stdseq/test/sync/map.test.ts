﻿import { seq } from "@lib"
it("should leave it empty", () => {
    const s = seq.empty().map(X => 1)
    expect(s.some().pull()).toBe(false)
})

it("should map", () => {
    const s = seq.of(1, 2, 3).map(v => v + 1)
    expect(s.toArray().pull()).toEqual([2, 3, 4])
})
