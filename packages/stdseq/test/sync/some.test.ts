﻿import { seq } from "@lib"

describe("no predicate", () => {
    it("gives false if empty", () => {
        expect(seq.empty<number>().some().pull()).toEqual(false)
    })

    it("gives true if single element", () => {
        expect(seq.of(1).some().pull()).toEqual(true)
    })
})
describe("predicate", () => {
    it("gives false if empty", () => {
        expect(
            seq
                .empty<number>()
                .some(() => true)
                .pull()
        ).toEqual(false)
    })

    it("gives true if single element", () => {
        expect(
            seq
                .of(1)
                .some(() => true)
                .pull()
        ).toEqual(true)
    })

    it("gives false if predicate is false", () => {
        expect(
            seq
                .of(1)
                .some(() => false)
                .pull()
        ).toEqual(false)
    })

    it("gives true if predicate is true", () => {
        expect(
            seq
                .of(1)
                .some(() => true)
                .pull()
        ).toEqual(true)
    })

    it("gives true if predicate is true for some", () => {
        expect(
            seq
                .of(1, 2, 3)
                .some(v => v === 2)
                .pull()
        ).toEqual(true)
    })

    it("gives false if predicate is false for all", () => {
        expect(
            seq
                .of(1, 2, 3)
                .some(v => v === 4)
                .pull()
        ).toEqual(false)
    })
})
