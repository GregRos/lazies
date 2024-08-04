import { lazy } from "../"

async function asyncIterateToArray<T>(iter: AsyncIterable<T>) {
    const result: T[] = []
    for await (const value of iter) {
        result.push(value)
    }
    return result
}
test("async iterates as singleton when value non-iterable", async () => {
    const results = asyncIterateToArray(lazy(async () => 1))
    await expect(results).resolves.toEqual([1])
})

test("async iterates inner elements when value iterable", () => {
    const results = asyncIterateToArray(lazy(async () => [1, 2, 3]))
    expect(results).resolves.toEqual([1, 2, 3])
})

test("async iterates inner elements when value iterable and nested", () => {
    const results = asyncIterateToArray(lazy(async () => lazy(() => [1, 2, 3])))
    expect(results).resolves.toEqual([1, 2, 3])
})

test("async iterates elements when nested array", () => {
    expect([
        ...lazy(() => [
            [1, 2],
            [3, 4]
        ])
    ]).toEqual([
        [1, 2],
        [3, 4]
    ])
})