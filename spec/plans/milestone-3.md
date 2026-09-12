# Milestone 3 – Enemies & Combat — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 3** מתוך `spec/MILESTONES.md`.
> מטרה: להפוך את ה-Prototype של M2 למשחק שאפשר "לשחק" בו — אויבים שנוצרים
> בהדרגה בחלק העליון ונעים לכיוון התותח, שלושה סוגי אויבים לפי גודל
> (1/2/3 פגיעות), Collision Detection בין קליע לאויב, מערכת Hit Points,
> חיסול עם אנימציית פיצוץ, מערכת ניקוד ו-HUD ראשוני (ניקוד + אויבים שנותרו).
>
> **לא** נכללים ב-Milestone זה: התנגשות אויב–תותח, חיים, Hit Lock, פיצוץ התותח,
> Restart של שלב, Level Configuration ל-10 שלבים, Level Complete, Win/Loss
> (כל אלה — M4); Dialog "סיים משחק", חסימת ניווט ומסכים מעוצבים (M5);
> localStorage וסטטיסטיקות (M6); Audio, Assets גרפיים סופיים ומשוב חזותי
> לפגיעה שאינה מחסלת (M7); PWA ו-Offline (M8).

---

## 0. הקשר ונקודת מוצא

מה שקיים היום (Milestone 1 + 2 הושלמו):

- `src/game/gameConfig.ts` — קבועים ל-M2 בלבד: `maxDeltaSeconds`, `projectile`,
  `cannon`, `background`, `colors`.
- `src/types/game.ts` — `Vector2`, `GameBounds`, `Projectile`.
- `src/game/GameLoop.ts` — rAF + Delta Time (גנרי, ללא תלות ב-Canvas).
- `src/game/Cannon.ts` — מיקום קבוע בתחתית, `aimAt()`, `update()`, `getMuzzlePosition()`.
- `src/game/Projectile.ts` — `createProjectile()`, `updateProjectile()`, `isOutOfBounds()`.
- `src/game/Renderer.ts` — `createStars()`, `drawBackground()`, `drawCannon()`, `drawProjectiles()`.
- `src/game/GameEngine.ts` — `start/stop/destroy/resize/shoot`, `update()` כרצף
  קריאות מסודר, `render()` כרצף ציור מסודר.
- `src/hooks/useGameEngine.ts` — יצירת Engine, `ResizeObserver`, `pointerdown`,
  Cleanup מלא (עמיד ל-StrictMode).
- `src/components/game-ui/GameCanvas.tsx` — עוטף את ה-Canvas, קורא ל-Hook.
- `src/pages/GamePage.tsx` — HUD **placeholder סטטי** (`aria-hidden`) + `GameCanvas`
  + כפתור "סיים משחק" שמנווט ל-`/`.

ב-M3 מוסיפים שכבת Entities שנייה (אויבים) + Collision + Score, ומחברים בפעם
הראשונה נתוני משחק אמיתיים אל React (HUD). זו נקודת ההשקה הראשונה בין המנוע
ל-UI — ולכן חשוב לממש אותה לפי `ARCHITECTURE §51` ו-`§54` (בלי Re-render לכל Frame).

אין צורך בשום חשבון, סיסמה או מפתח API עבור Milestone 3 — הכל מקומי.

---

## 1. החלטות טכניות ל-Milestone זה

| נושא | החלטה | נימוק |
|------|--------|--------|
| מודל אויב | `interface Enemy` בדיוק לפי `ARCHITECTURE §14` | אין להמציא שדות מיותרים |
| הבדלה בין סוגים | **גודל בלבד** — `small`/`medium`/`large`, HP 1/2/3, Score 1/2/3 | PRD §4.6, ARCHITECTURE §15 |
| Health Bar | **אין** | PRD §4.6 מפורשות |
| תנועת אויב | Vector מחושב **פעם אחת** ב-Spawn לעבר התותח + סטייה אקראית קטנה | §16 — "כמעט ישר", אין Homing |
| Collision | **מעגל–קטע** (Swept) בין מסלול הקליע בפריים לבין מעגל האויב | מונע Tunneling — ראו §3.3 להלן |
| קליע ↔ אויב | קליע פוגע ב**אויב הראשון במסלולו** ואז נעלם | PRD §4.5 |
| אויב ↔ אויב | **אין** Collision Detection | §16 — אויבים עוברים אחד דרך השני |
| אויב ↔ תותח | **לא ב-M3** — אויב שעובר את הגבול התחתון מוסר בשקט | Slice של M4 (`Enemy–Cannon Collision`) |
| ספירת אויבים | `enemiesRemaining = טרם נוצרו + פעילים על המסך` | מתלכד עם תנאי סיום השלב ב-§20 (M4) |
| Spawner ב-M3 | **גל Prototype יחיד** (`prototypeWave` ב-config), לא Level Config | Level Configuration ל-10 שלבים הוא Slice של M4 |
| פיצוץ | ישות `Explosion` קצרה מצוירת ב-Canvas (וקטורית) | §45 — בלי DOM Element לכל פיצוץ; Sprite אמיתי ב-M7 |
| גרפיקת אויבים | צורות Canvas וקטוריות צבעוניות וידידותיות | Assets אמיתיים = M7 §42 |
| חיבור ל-HUD | Callback `onStatsChange` שנקרא **רק כשערך משתנה** | §54 — אין `setState` לכל Frame |
| מיקום ה-Hook | `useGameEngine` עולה מ-`GameCanvas` ל-`GamePage` | ה-HUD (React) זקוק לנתונים; §41 — HUD מחוץ ל-Canvas |
| קבועים | **הכל** ב-`gameConfig.ts` | §62, §63 |

### החלטות שאינן מוגדרות במפורש באף מסמך

לפי `ARCHITECTURE §66.3` ("אם דרישה טכנית אינה מוגדרת בשני המסמכים — לבחור בפתרון
הפשוט ביותר שמתאים ל-MVP"). כולן מתועדות כאן ואינן דורשות עצירה:

1. **מה קורה לאויב שמגיע לתחתית ב-M3.** ב-M4 הוא יפגע בתותח ויוריד חיים. ב-M3
   עדיין אין חיים, ולכן אויב שחצה את הגבול התחתון פשוט מסומן `active = false`
   ומוסר, ללא ניקוד וללא פיצוץ. התנהגות זמנית שתוחלף במלואה ב-M4.
2. **נוסחת "אויבים שנותרו".** `notYetSpawned + activeOnScreen` (ולא
   `planned − destroyed`). הסיבה: זו בדיוק הנוסחה שמגיעה ל-0 בתנאי סיום השלב של
   `§20`, כך שב-M4 `enemiesRemaining === 0` יהיה תנאי ה-Level Complete ללא שינוי.
3. **הטבת פגיעה (`hitRadiusBonus`).** רדיוס הפגיעה של אויב יהיה מעט גדול
   מהרדיוס המצויר (ברירת מחדל +3px). המשחק מיועד לילדים 6–12 ו-PRD דורש
   "מאתגר אך לא קשה מדי"; במובייל דיוק הנגיעה נמוך.
4. **אויבים בעת Resize.** ה-`x` של כל אויב פעיל ייצמד (clamp) לגבולות החדשים,
   והמהירות תישמר. `§35` מתיר "Reposition קצר" של אויבים בשינוי Orientation.
   טיפול Orientation מלא — M8.
5. **סיום הגל ב-M3.** כשכל אויבי הגל נוצרו וחוסלו/יצאו, ה-Spawner פשוט מפסיק,
   המסך מתרוקן וה-HUD מציג "נותרו: 0". אין הודעה, אין מעבר — זה Slice של M4.

> אם במהלך הבנייה תתעורר סתירה אמיתית שכלל התחומים אינו פותר — **לעצור ולשאול**
> לפי `CLAUDE.md`.

---

## 2. מפת הקבצים (יצירה / שינוי)

**ליצור:**

```text
src/game/random.ts                     ← עזרי אקראיות מוגבלת (randomRange, pickWeighted)
src/game/Enemy.ts                      ← יצירה, תנועה, ספיגת פגיעה, בדיקת גבולות
src/game/EnemySpawner.ts               ← גל אויבים: כמה, מתי, איזה סוג, איפה
src/game/CollisionManager.ts           ← Projectile ↔ Enemy (Swept circle-segment)
src/game/Explosion.ts                  ← יצירה ועדכון של אנימציות פיצוץ
src/components/game-ui/GameHud.tsx     ← HUD ראשוני (React, מחוץ ל-Canvas)
src/components/game-ui/GameHud.css
```

**לשנות:**

```text
src/types/game.ts                      ← EnemySize, Enemy, Explosion, GameStats; prevX/prevY ל-Projectile
src/game/gameConfig.ts                 ← enemyTypes, enemy, prototypeWave, explosion, colors חדשים
src/game/Projectile.ts                 ← שמירת המיקום הקודם לצורך Swept Collision
src/game/Renderer.ts                   ← drawEnemies(), drawExplosions()
src/game/GameEngine.ts                 ← חיווט מלא: Spawner, אויבים, Collision, Score, Stats
src/hooks/useGameEngine.ts             ← החזקת GameStats ב-React State + ניקוי ה-Callback
src/components/game-ui/GameCanvas.tsx  ← מקבל refs כ-props (ה-Hook עולה ל-GamePage)
src/pages/GamePage.tsx                 ← קורא ל-Hook, מרנדר GameHud עם נתונים אמיתיים
src/pages/GamePage.css                 ← ה-HUD הישן עובר ל-GameHud.css
spec/MILESTONES.md                     ← סימון Slices 1–9 של M3 כ-✅ תוך כדי העבודה
```

**לא לגעת ב-M3:** `GameLoop.ts`, `Cannon.ts`, `App.tsx`, `Navigation`, שאר המסכים,
`styles/variables.css`.

---

## 3. Types ו-Config

### 3.1 `src/types/game.ts` — תוספות

```ts
/** מקור: spec/ARCHITECTURE.md §14–15. הגודל הוא גם מדד החוזק (PRD §4.6). */
export type EnemySize = 'small' | 'medium' | 'large';

export interface Enemy {
  id: string;
  size: EnemySize;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  hitPoints: number;
  maxHitPoints: number;
  scoreValue: number;
  active: boolean;
}

/** אנימציית פיצוץ קצרה (ARCHITECTURE §45). נמחקת כשה-elapsed עובר את ה-duration. */
export interface Explosion {
  id: string;
  x: number;
  y: number;
  /** רדיוס השיא — נגזר מגודל האויב שהתפוצץ. */
  maxRadius: number;
  elapsedSeconds: number;
  durationSeconds: number;
}

/** מה שה-UI (React) צריך לדעת — ותו לא (ARCHITECTURE §54). */
export interface GameStats {
  score: number;
  enemiesRemaining: number;
}
```

ל-`Projectile` נוספים שני שדות (`ARCHITECTURE §12` מגדיר "לפחות" את השדות שבו):

```ts
  /** המיקום בתחילת הפריים — נדרש ל-Swept Collision (ראו §3.3). */
  prevX: number;
  prevY: number;
```

`GameState` / `GameStatus` המלאים (`§8`) **אינם** נוספים ב-M3 — הם דורשים
`lives`, `currentLevel` ו-`status`, שכולם Slices של M4.

### 3.2 `src/game/gameConfig.ts` — תוספות

```ts
  /** ARCHITECTURE §15 — HP וניקוד לפי גודל בלבד. */
  enemyTypes: {
    small:  { hitPoints: 1, score: 1, radius: 15 },
    medium: { hitPoints: 2, score: 2, radius: 22 },
    large:  { hitPoints: 3, score: 3, radius: 30 },
  },

  enemy: {
    /** תוספת סלחנות לרדיוס הפגיעה (ראו §1, החלטה 3). */
    hitRadiusBonus: 3,
    /** שוליים מינימליים מקצה המסך במיקום ה-Spawn, ב-px. */
    spawnMarginX: 24,
    /** סטייה זוויתית מקסימלית מהקו הישר אל התותח, ברדיאנים (~9°). */
    maxAimJitter: 0.16,
    /** שוליים מתחת לגבול התחתון שאחריהם האויב מוסר (M3 בלבד). */
    despawnMarginY: 60,
  },

  /**
   * גל Prototype ל-M3 בלבד. ב-M4 יוחלף ב-LEVELS[] (Level Configuration
   * ל-10 שלבים) — ואז יש להסיר את הבלוק הזה.
   */
  prototypeWave: {
    enemyCount: 12,
    spawnIntervalMinSeconds: 1.0,
    spawnIntervalMaxSeconds: 2.0,
    /** השהיה לפני האויב הראשון, כדי שהשחקן יספיק להתמקם. */
    firstSpawnDelaySeconds: 0.8,
    speedMin: 30,
    speedMax: 55,
    /** סכום ההסתברויות = 1. */
    smallProbability: 0.5,
    mediumProbability: 0.35,
    largeProbability: 0.15,
  },

  explosion: {
    durationSeconds: 0.45,
    /** מכפיל בין רדיוס האויב לרדיוס השיא של הפיצוץ. */
    radiusMultiplier: 2.2,
    ringWidth: 4,
    sparkCount: 8,
  },
```

ול-`colors` נוספים (מקור: `DESIGN.md` — "יצורי חלל מצחיקים וצבעוניים",
"פיצוצים בגווני כתום, צהוב וסגול"):

```ts
    enemySmall: '#4CD964',
    enemyMedium: '#00E5FF',
    enemyLarge: '#9B5CFF',
    enemyEye: '#0B1026',
    enemyEyeSpark: '#F8FAFF',
    explosionCore: '#FFC83D',
    explosionRing: '#FF8A3D',
    explosionSpark: '#9B5CFF',
```

### 3.3 למה Swept Collision ולא בדיקת מרחק פשוטה

מהירות הקליע היא `900 px/s`, ו-`maxDeltaSeconds = 0.05` — כלומר קליע יכול לעבור
עד **45px בפריים אחד**. קוטר אויב קטן הוא 30px. בדיקת מרחק נקודתית
(`hypot(dx, dy) < r`) תפספס אויבים קטנים לחלוטין בחלק מהפריימים — באג שמרגיש
למשתמש כמו "המשחק לא מגיב".

לכן: בכל פריים נבדוק את **הקטע** `(prevX, prevY) → (x, y)` מול מעגל האויב.

---

## 4. Slice 1+2 — Enemy Model ושלושת הסוגים

`src/game/Enemy.ts` — פונקציות טהורות בלבד, בסגנון `Projectile.ts` הקיים:

```ts
export function createEnemy(id, size, origin: Vector2, target: Vector2, speed: number): Enemy
export function updateEnemy(enemy: Enemy, deltaSeconds: number): void
export function applyHit(enemy: Enemy): void          // hitPoints--
export function isDestroyed(enemy: Enemy): boolean    // hitPoints <= 0
export function hasPassedBottom(enemy: Enemy, bounds: GameBounds): boolean
export function getEnemyRadius(size: EnemySize): number
export function getHitRadius(size: EnemySize): number // radius + hitRadiusBonus
export function clampEnemyToBounds(enemy: Enemy, bounds: GameBounds): void
```

`createEnemy` מחשב Vector אל התותח פעם אחת, עם סטייה אקראית קטנה:

```ts
const angle = Math.atan2(target.y - origin.y, target.x - origin.x)
            + randomRange(-maxAimJitter, maxAimJitter);
velocityX = Math.cos(angle) * speed;
velocityY = Math.sin(angle) * speed;
```

שדות `hitPoints`, `maxHitPoints` ו-`scoreValue` נלקחים ישירות מ-`enemyTypes[size]`.
`maxHitPoints` נשמר לפי `§14` וישמש ב-M7 למשוב חזותי לפגיעה שאינה מחסלת.

> **הערה על משוב חזותי לפגיעה:** `MILESTONES.md` מקצה את "Visual Feedback לפגיעה"
> ל-**M7 Slice 9**. ב-M3 אויב שספג פגיעה ולא חוסל רק ממשיך לנוע. לא להקדים.

---

## 5. Slice 3 — Enemy Spawner

`src/game/EnemySpawner.ts` — מחלקה עם State פנימי (מונה + טיימר):

```ts
export class EnemySpawner {
  constructor(config: WaveConfig)
  reset(): void                 // מאפס מונה וטיימר — M4 ישתמש בזה ב-Restart Level
  get remainingToSpawn(): number
  get isFinished(): boolean     // כל האויבים המתוכננים כבר נוצרו
  update(deltaSeconds: number, bounds: GameBounds, cannonPosition: Vector2): Enemy[]
}
```

התנהגות:

- `plannedCount` נקבע פעם אחת ב-`reset()` (ב-M3 קבוע מה-config; ב-M4 יוגרל מטווח).
- טיימר יורד ב-`deltaSeconds`; כשמגיע ל-0 → יצירת אויב + הגרלת המרווח הבא
  מתוך `[spawnIntervalMin, spawnIntervalMax]`.
- מיקום Spawn: `x = randomRange(margin + radius, bounds.width - margin - radius)`,
  `y = -radius` — האויב "נכנס" מלמעלה במקום להופיע פתאום (`§17`).
- סוג: `pickWeighted` לפי שלוש ההסתברויות.
- מהירות: `randomRange(speedMin, speedMax)` — Random Variation לפי `§16`.
- `update()` **מחזיר מערך** במקום לדחוף ישירות ל-Engine, כדי שה-Spawner לא יחזיק
  בעלות על ה-State של המשחק.

`src/game/random.ts`:

```ts
export function randomRange(min: number, max: number): number
export function randomInt(minInclusive: number, maxInclusive: number): number
export function pickWeighted<T>(entries: ReadonlyArray<readonly [T, number]>): T
```

`§19`: כל האקראיות עוברת דרך הפונקציות האלה ומוגבלת על ידי ה-config. אין קושי
אקראי לחלוטין.

---

## 6. Slice 4 — תנועת אויבים

ב-`GameEngine.update()`:

```ts
for (const enemy of this.enemies) {
  updateEnemy(enemy, deltaSeconds);
  if (hasPassedBottom(enemy, this.bounds)) enemy.active = false;  // M3 בלבד
}
```

מיקום התותח נמסר ל-Spawner בזמן ה-Spawn (`this.cannon.x`, `this.cannon.y`),
כך שאויב שנוצר **אחרי** Resize מכוון למיקום התותח החדש. אויבים קיימים שומרים על
המהירות שלהם ורק נצמדים לגבולות (`clampEnemyToBounds`) — ראו §1 החלטה 4.

---

## 7. Slice 5+6 — Collision ו-Hit Points

`src/game/CollisionManager.ts`:

```ts
export interface ProjectileHit {
  projectile: Projectile;
  enemy: Enemy;
}

/** לכל קליע פעיל — האויב הראשון במסלולו בפריים הנוכחי (PRD §4.5). */
export function detectProjectileHits(
  projectiles: readonly Projectile[],
  enemies: readonly Enemy[],
): ProjectileHit[]
```

האלגוריתם, לכל קליע פעיל:

1. הקטע `A = (prevX, prevY)`, `B = (x, y)`.
2. לכל אויב פעיל: לחשב את `t ∈ [0,1]` של הנקודה הקרובה ביותר על הקטע למרכז
   האויב; אם המרחק בנקודה זו `<= getHitRadius(enemy.size)` → יש פגיעה.
   מקרה קצה: `A === B` (פריים עם `delta = 0`) → נפילה לבדיקת מרחק נקודתית.
3. לבחור את האויב עם ה-`t` **הקטן ביותר** — האויב הראשון במסלול.
4. לסמן מיד `projectile.active = false` כדי שלא ייבחר שוב באותו פריים.
   קליע לעולם אינו פוגע ביותר מאויב אחד (PRD §4.5, ARCHITECTURE §13).

הטיפול בתוצאות נשאר ב-`GameEngine` (ה-Manager אינו משנה HP ואינו מעדכן ניקוד):

```ts
for (const { enemy } of hits) {
  applyHit(enemy);                       // hitPoints--
  if (isDestroyed(enemy)) {
    enemy.active = false;
    this.score += enemy.scoreValue;
    this.explosions.push(createExplosion(id, enemy));
  }
}
```

אויב שספג פגיעה אך לא חוסל **ממשיך לנוע** ללא שינוי (M3 Slice 6).

---

## 8. Slice 7 — חיסול ואנימציית פיצוץ

`src/game/Explosion.ts`:

```ts
export function createExplosion(id: string, enemy: Enemy): Explosion
export function updateExplosion(explosion: Explosion, deltaSeconds: number): void
export function isExplosionFinished(explosion: Explosion): boolean
```

- `maxRadius = getEnemyRadius(enemy.size) * explosion.radiusMultiplier`.
- ב-`Renderer.drawExplosions()`: `progress = elapsed / duration`; טבעת מתרחבת
  (`explosionRing`) + גרעין דוהה (`explosionCore`) + `sparkCount` ניצוצות
  שמתפזרים החוצה (`explosionSpark`), כולם ב-`globalAlpha = 1 - progress`.
- כיוון הניצוצות נגזר מ-`index` (זווית קבועה לכל ניצוץ) ולא מ-`Math.random()`
  בזמן הציור — אחרת הפיצוץ "ירצד" בין פריימים.
- האויב מוסר מהמערך **מיד** עם החיסול; הפיצוץ הוא ישות נפרדת עם מחזור חיים משלו
  (`§45` — כך אין צורך להשאיר אויבים מתים בזיכרון).
- אין DOM Element לאף פיצוץ (`§45`).

Sprite Sheet / Assets אמיתיים — **M7 Slices 8+10**. כאן צורות וקטוריות בלבד.

---

## 9. Slice 8 — מערכת ניקוד

- `score` הוא שדה של `GameEngine` (מספר בלבד; לא ב-React State).
- מתעדכן **רק** בחיסול, בגובה `enemy.scoreValue` (1/2/3 לפי הגודל).
- פגיעה שאינה מחסלת אינה מזכה בנקודות. ירי לשטח ריק אינו מזכה בנקודות (PRD §4.5).
- הניקוד אינו מתאפס ב-M3 (אין עדיין שלבים/חיים; PRD §4.7 — יאומת שוב ב-M4).

---

## 10. Slice 9 — HUD ראשוני והחיבור ל-React

### 10.1 ערוץ הנתונים מהמנוע ל-UI

ב-`GameEngine`:

```ts
private stats: GameStats = { score: 0, enemiesRemaining: 0 };
private onStatsChange: ((stats: GameStats) => void) | null = null;

setOnStatsChange(cb: ((stats: GameStats) => void) | null): void

/** נקרא בסוף update() — משדר רק כששדה השתנה בפועל (ARCHITECTURE §54). */
private publishStats(): void {
  const enemiesRemaining = this.spawner.remainingToSpawn + this.enemies.length;
  if (enemiesRemaining === this.stats.enemiesRemaining && this.score === this.stats.score) return;
  this.stats = { score: this.score, enemiesRemaining };
  this.onStatsChange?.(this.stats);
}
```

`destroy()` יאפס גם `this.onStatsChange = null` — אין `setState` אחרי Unmount.

> `enemiesRemaining` לפי החלטה 2 ב-§1: אויבים שטרם נוצרו + אויבים פעילים על המסך.

### 10.2 `useGameEngine` — תוספת State

```ts
const [stats, setStats] = useState<GameStats>({ score: 0, enemiesRemaining: 0 });
// בתוך ה-effect, לפני engine.start():
engine.setOnStatsChange(setStats);
// ב-cleanup, לפני engine.destroy():
engine.setOnStatsChange(null);

return { containerRef, canvasRef, stats };
```

ה-Hook נשאר האחראי היחיד על Resize, Input ו-Cleanup — אין שינוי בהתנהגות הקיימת.

### 10.3 מבנה הרכיבים

ה-HUD הוא React מחוץ ל-Canvas (`§41`), ולכן ה-Hook צריך לחיות מעל שניהם:

```text
GamePage            ← קורא ל-useGameEngine(); מחזיק את ה-refs ואת ה-stats
  ├── GameHud       ← props: score, enemiesRemaining   (חדש)
  ├── GameCanvas    ← props: containerRef, canvasRef    (שונה: מקבל refs במקום לקרוא ל-Hook)
  └── Button "סיים משחק"
```

`GameHud.tsx` — ארבעה פריטים לפי PRD §4.3 ו-`DESIGN.md`, אך רק שניים מוזנים מהמנוע:

| פריט | מקור ב-M3 |
|------|-----------|
| ⭐ ניקוד | `props.score` — אמיתי |
| 👾 נותרו | `props.enemiesRemaining` — אמיתי |
| ❤️ חיים | קבוע `3` + הערה `// M4` |
| 🚀 שלב | קבוע `1` + הערה `// M4` |

השארת שני ה-placeholders שומרת על פריסת ה-HUD יציבה ומונעת שינוי עיצובי מיותר
ב-M4. ה-`aria-hidden` הקיים **מוסר** — המספרים כעת אמיתיים ורלוונטיים לקורא מסך.
עיצוב מלא של ה-HUD לפי ה-Mockups — M5 Slice 2.

ה-CSS של `.game-page__hud*` עובר כמות שהוא ל-`GameHud.css` תחת `.game-hud*`.

---

## 11. `GameEngine` — סדר העדכון והציור

`update(deltaSeconds)` — הרחבה של הרצף הקיים, לפי `ARCHITECTURE §7`:

```text
1. cannon.update(delta)
2. spawner.update(delta, bounds, cannonPosition) → push לאויבים
3. לכל אויב: updateEnemy + בדיקת גבול תחתון (M3: active = false)
4. לכל קליע: updateProjectile (כולל שמירת prevX/prevY) + isOutOfBounds
5. detectProjectileHits → applyHit / חיסול / score / explosion
6. סינון אויבים וקליעים לא פעילים
7. updateExplosion לכל פיצוץ + סינון שהסתיימו
8. publishStats()
```

`render()` — סדר שכבות:

```text
drawBackground → drawEnemies → drawCannon → drawProjectiles → drawExplosions
```

(פיצוצים מעל הכל כדי שיהיו בולטים; התותח מעל האויבים כדי שלא "ייבלע".)

`resize()` מקבל תוספת אחת: `clampEnemyToBounds` לכל אויב פעיל.

---

## 12. ציור האויבים (`Renderer.drawEnemies`)

לפי `DESIGN.md` ("יצורי חלל מצחיקים וצבעוניים") ו-`ARCHITECTURE §43`
(שפה גרפית זהה, גודל שונה, לא מפחיד):

- גוף: כיפה/עיגול בצבע לפי הסוג (`enemySmall/Medium/Large`) עם `shadowBlur` קל.
- תחתית מסולסלת (2–4 "רגליים") — נותן אופי של יצור ולא של כדור.
- שתי עיניים גדולות (`enemyEye`) עם נקודת ברק (`enemyEyeSpark`) — ידידותי ומצחיק.
- כל המידות נגזרות מ-`getEnemyRadius(size)` — אותה פונקציית ציור לשלושת הסוגים,
  כך שהם נבדלים בגודל ובצבע בלבד.
- בלי Health Bar, בלי מספרים, בלי טקסט (PRD §4.6).

---

## 13. תוכנית בדיקה ידנית ל-Milestone 3

| # | תרחיש | תוצאה מצופה |
|---|--------|--------------|
| 1 | פתיחת `/game` | אחרי ~0.8 שניות מופיע האויב הראשון מלמעלה |
| 2 | המתנה ללא ירי | אויבים ממשיכים להופיע בקצב משתנה ובמיקומי X שונים |
| 3 | צפייה בתנועה | כל אויב נע לכיוון התותח בקו כמעט ישר; המסלולים אינם זהים |
| 4 | ירי על אויב **קטן** | פגיעה אחת → פיצוץ → נעלם → ניקוד +1 |
| 5 | ירי פעם אחת על אויב **בינוני** | ממשיך לנוע; אין פיצוץ; אין ניקוד |
| 6 | ירי פעם שנייה על אותו בינוני | פיצוץ → נעלם → ניקוד +2 |
| 7 | ירי שלוש פעמים על אויב **גדול** | חוסל רק בפגיעה השלישית → ניקוד +3 |
| 8 | ירי לשטח ריק | הקליע ממשיך עד הגבול; אין שינוי בניקוד |
| 9 | ירי כשאויב אחר חוסם את המסלול | נפגע האויב ה**ראשון** במסלול; הקליע נעלם |
| 10 | ירי מטווח קצר מאוד לעבר אויב קרוב | הפגיעה נרשמת (בדיקת Swept Collision) |
| 11 | שני אויבים חופפים + ירייה אחת | נפגע אחד בלבד; הקליע אינו ממשיך לשני |
| 12 | צפייה באויבים חופפים | עוברים אחד דרך השני ללא התנגשות (§16) |
| 13 | אויב מגיע לתחתית | נעלם בשקט; אין פיצוץ, אין ניקוד, אין קריסה (M3 בלבד) |
| 14 | מעקב אחרי "נותרו" ב-HUD | יורד ב-1 בכל חיסול ובכל אויב שיצא; מגיע ל-0 בסוף הגל |
| 15 | סיום הגל (12 אויבים) | ה-Spawner נעצר; המסך מתרוקן; "נותרו: 0"; אין שגיאות |
| 16 | מעקב אחרי "ניקוד" ב-HUD | מתעדכן מיד עם כל חיסול, בהתאם לגודל האויב |
| 17 | שינוי גודל חלון באמצע גל | אויבים נשארים בתוך הגבולות; אין קריסה; הניקוד נשמר |
| 18 | DevTools → אמולציית מובייל | נגיעה יורה; הדף אינו נגלל; התנועה חלקה |
| 19 | יציאה וכניסה חוזרת ל-`/game` | גל חדש מההתחלה; ניקוד 0; אין כפילות אויבים (StrictMode) |
| 20 | React DevTools → Profiler | אין Re-render לכל Frame; רק בשינוי ניקוד/מונה |
| 21 | `npm run build` | עובר; אפס שגיאות TypeScript |
| 22 | `npm run lint` | עובר נקי |

---

## 14. Definition of Done ל-Milestone 3

מתוך `MILESTONES.md` + דרישות הקוד מ-`ARCHITECTURE §61`:

- [ ] אויבים מופיעים בהדרגה בחלק העליון במיקומי X אקראיים.
- [ ] האויבים נעים בקו כמעט ישר לכיוון התותח, עם שונות קטנה במהירות ובמסלול.
- [ ] שלושת הסוגים עובדים: קטן = פגיעה אחת/נקודה, בינוני = 2/2, גדול = 3/3.
- [ ] הבדלת הסוגים ויזואלית לפי גודל בלבד; אין Health Bar.
- [ ] Collision Detection בין קליע לאויב מזוהה נכון, כולל מטווח קצר ובמהירות מלאה.
- [ ] קליע נעלם אחרי פגיעה אחת ואינו פוגע ביותר מאויב אחד.
- [ ] קליע פוגע באויב הראשון במסלולו, גם אם אינו יעד הלחיצה המקורי.
- [ ] אויב שספג פגיעה ולא חוסל ממשיך לנוע.
- [ ] אויב שחוסל מפעיל אנימציית פיצוץ קצרה ומוסר מהמשחק.
- [ ] הניקוד מתעדכן נכון בהתאם לגודל האויב, ורק בחיסול.
- [ ] ה-HUD מציג ניקוד ומספר אויבים שנותרו, ומתעדכן בזמן אמת.
- [ ] React אינו מבצע Re-render בכל Frame; אובייקטי משחק אינם ב-React State.
- [ ] `src/game/` עדיין אינו מייבא React.
- [ ] Cleanup מלא ביציאה מהמסך, כולל איפוס ה-Callback של ה-Stats.
- [ ] `npm run build` ו-`npm run lint` עוברים ללא שגיאות; אין `any`.
- [ ] אין Console Errors בשימוש רגיל.
- [ ] כל Slices 1–9 של Milestone 3 מסומנים ✅ ב-`spec/MILESTONES.md`.

---

## 15. הכנה ל-Milestone 4 (לא לממש עכשיו)

הפרדות שכדאי לשמור ב-M3 כדי ש-M4 (חיים, שלבים, Win/Loss) יתחבר בלי שכתוב —
**בלי** לכתוב קוד עבורן עכשיו:

- `EnemySpawner.reset()` כבר קיים — M4 יקרא לו ב-Restart Level ובתחילת כל שלב.
- `prototypeWave` בעל אותה צורה שתהיה ל-`LevelConfig` (`§18`), כך שהחלפתו
  ב-`LEVELS[10]` + `LevelManager` תהיה החלפת מקור נתונים בלבד.
- `enemiesRemaining === 0 && spawner.isFinished` הוא בדיוק תנאי ה-Level Complete
  של `§20` — M4 רק יוסיף עליו `status`.
- `publishStats()` הוא הנקודה היחידה שמשדרת ל-UI; M4 יוסיף לה `lives`,
  `currentLevel` ו-`status` באותו מנגנון.
- הסרת אויב שחצה את הגבול התחתון היא השורה היחידה שתוחלף ב-M4 ב-Enemy–Cannon
  Collision + Hit Lock.

---

## 16. עצירות ונקודות אישור (לפי `CLAUDE.md`)

- **לא לבצע `git commit` ולא deploy** בלי אישור מפורש מהמפתח.
- אין צורך בחשבונות/מפתחות ל-M3 — אם בכל זאת יתעורר צורך, **לעצור ולשאול**.
- בסיום Milestone 3 — **לעצור ולהמתין לבדיקת המפתח** לפני מעבר ל-Milestone 4.
- כל סתירה אמיתית בין מסמכים שאינה נפתרת בכלל התחום → **לשאול לפני החלטה**.
