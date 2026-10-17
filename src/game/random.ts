/**
 * Bounded-randomness helpers (within Config limits) — Milestone 3 (Enemies & Combat).
 * Source: spec/ARCHITECTURE.md §19 (bounded Randomization, not fully random).
 */

/** A random number in [min, max). */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** A random integer in [minInclusive, maxInclusive]. */
export function randomInt(minInclusive: number, maxInclusive: number): number {
  return Math.floor(randomRange(minInclusive, maxInclusive + 1));
}

/**
 * Weighted random pick. Weights don't need to sum to 1 — normalized internally.
 * Zero-weight entries are never picked. Falls back safely to the last value
 * if the total weight isn't positive (protects against a Config mistake).
 */
export function pickWeighted<T>(entries: ReadonlyArray<readonly [T, number]>): T {
  const weighted = entries.filter(([, weight]) => weight > 0);
  if (weighted.length === 0) return entries[entries.length - 1][0];
  const total = weighted.reduce((sum, [, weight]) => sum + weight, 0);

  let roll = Math.random() * total;
  for (const [value, weight] of weighted) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  // Floating-point leftovers can leave roll a hair above 0 — fall back to
  // the last entry that is actually allowed.
  return weighted[weighted.length - 1][0];
}
