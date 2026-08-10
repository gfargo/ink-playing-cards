/**
 * Pure helpers for player-roster operations, shared by `GameContext` and
 * `DeckContext`'s `REORDER_PLAYERS` reducer cases.
 */

/**
 * True when `next` contains exactly the same players as `current` (same
 * length, no duplicates, no additions/removals) in any order. Reducers use
 * this to treat a non-permutation `REORDER_PLAYERS` payload as a no-op
 * rather than silently dropping or duplicating players.
 */
export function isPlayerPermutation(
  current: string[],
  next: string[]
): boolean {
  if (current.length !== next.length) return false
  const currentSet = new Set(current)
  const nextSet = new Set(next)
  if (nextSet.size !== next.length) return false
  for (const player of currentSet) {
    if (!nextSet.has(player)) return false
  }

  return true
}
