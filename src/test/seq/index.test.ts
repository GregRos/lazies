﻿import { Seq, seqs } from "@lib";
import { expect } from "@assertive-ts/core";
it("should do nothing on empty", () => {
    const a = seqs.empty().index();
    expect(a.isEmpty().pull()).toBe(true);
});

it("should attach index", () => {
    const a = seqs.of(1, 2, 3).index();
    expect(a.toArray().pull()).toBeEqual([
        [0, 1],
        [1, 2],
        [2, 3]
    ]);
});
