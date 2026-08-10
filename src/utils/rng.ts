/**
 * Creates a seeded pseudo-random number generator (mulberry32).
 * Returns a function compatible with `Math.random` (returns a float in
 * `[0, 1)`), so it can be passed anywhere an `rng` is accepted for
 * deterministic shuffles, card IDs, and replays.
 */
/* eslint-disable no-bitwise, unicorn/prefer-math-trunc, unicorn/numeric-separators-style -- 32-bit integer arithmetic is intrinsic to this PRNG algorithm */
export function mulberry32(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/* eslint-enable no-bitwise, unicorn/prefer-math-trunc, unicorn/numeric-separators-style */
