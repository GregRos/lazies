﻿import { seq } from "@lib"

it("should not call func on empty", () => {
    let i = 0

    seq.empty().forEach(() => {
        i++
    })
    expect(i).toEqual(0)
})

it("should call func for each element", () => {
    let i = 0

    seq.of(1, 2, 3).forEach(() => {
        i++
    })
    expect(i).toEqual(3)
})
