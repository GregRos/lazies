import { LazyLike, lazy } from "../index";
import { Lazy } from "./lazy";

export type Pulled<T> = T extends PromiseLike<infer X>
    ? Promise<PulledAwaited<X>>
    : T extends LazyLike<infer X>
    ? Pulled<X>
    : T;

export type PulledAwaited<T> = T extends LazyLike<infer R>
    ? PulledAwaited<R>
    : T extends PromiseLike<infer R>
    ? PulledAwaited<R>
    : T;

export type LazyAsync<T> = Lazy<Promise<T>>;
