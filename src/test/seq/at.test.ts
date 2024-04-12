﻿import { Seq } from "@lib";
import { seqs } from "../../lib/seq/sync/seqs";
import { expect } from "@assertive-ts/core";
it("get at 0", () => {
    const s = seqs.of(1, 2, 3);
    expect(s.at(0).pull()).toBeEqual(1);
});

it("get at missing index is range error", () => {
    const s = seqs.of(1, 2, 3);
    expect(() => s.at(3)).toThrowError(RangeError);
});

it("get at negative index", () => {
    const s = seqs.of(1, 2, 3);
    expect(s.at(-1).pull()).toBeEqual(3);
});
