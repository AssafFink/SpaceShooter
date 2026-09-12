/**
 * עזרי אקראיות מוגבלת (בתוך גבולות Config) — Milestone 3 (Enemies & Combat).
 * מקור: spec/ARCHITECTURE.md §19 (Randomization מוגבל, לא אקראי לחלוטין).
 */

/** מספר אקראי ב-[min, max). */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** מספר שלם אקראי ב-[minInclusive, maxInclusive]. */
export function randomInt(minInclusive: number, maxInclusive: number): number {
  return Math.floor(randomRange(minInclusive, maxInclusive + 1));
}

/**
 * בחירה אקראית משוקללת. משקלים אינם חייבים לסכום ל-1 — מנורמלים פנימית.
 * נופל בבטחה לערך האחרון אם סכום המשקלים אינו חיובי (הגנה מפני שגיאת Config).
 */
export function pickWeighted<T>(entries: ReadonlyArray<readonly [T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return entries[entries.length - 1][0];

  let roll = Math.random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}
