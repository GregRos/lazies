import { lazy } from "@lib";
import { LazyAsync } from "@lib";
import { expect } from "@assertive-ts/core";
it("zips only sync", () => {
    const [a, b, c] = [lazy(() => 1 as const), lazy(() => 2), lazy(() => 3)];
    const zipped = a.zip(b, c);
    expect(zipped.pull()).toBeEqual([1 as const, 2, 3]);
});

it("zip empty type error", () => {
    const a = lazy(() => 1 as const);
    // @ts-expect-error
    a.zip();
});

it("can zip two", () => {
    const a = lazy(() => 1 as const);
    const b = lazy(() => 2);
    const zipped = a.zip(b);
    expect(zipped.pull()).toBeEqual([1 as const, 2]);
});

it("can zip three", () => {
    const a = lazy(() => 1 as const);
    const b = lazy(() => 2);
    const c = lazy(() => 3);
    const zipped = a.zip(b, c);
    expect(zipped.pull()).toBeEqual([1 as const, 2, 3]);
});

it("this async makes result async", async () => {
    const a = lazy(async () => 1 as const);
    const b = lazy(() => 2);
    const zipped = a.zip(b) satisfies LazyAsync<unknown>;
    const resolved = await zipped.pull();
    expect(resolved).toBeEqual([1 as const, 2]);
});

it("one async makes result async", async () => {
    const a = lazy(async () => 1 as const);
    const b = lazy(async () => 2);
    const zipped = a.zip(b) satisfies LazyAsync<unknown>;
    const resolved = await zipped.pull();
    expect(resolved).toBeEqual([1 as const, 2]);
});