# Milestone 4 – Lives, Levels & Game Rules — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 4** מתוך `spec/MILESTONES.md`.
> מטרה: להפוך את הגל היחיד של M3 למשחק מלא עם חוקים — 10 שלבים ברמת קושי
> עולה, מערכת חיים (3), התנגשות אויב–תותח עם Hit Lock ופיצוץ התותח, Restart
> של השלב תוך שמירת ניקוד וחיים, זיהוי השלמת שלב + הודעת "שלב X הושלם" ומעבר
> אוטומטי, ותנאי Win (סוף שלב 10) ו-Loss (איבוד החיים השלישי) עם מעבר למסך
> הסיום. בסוף M4 אפשר לשחק רצף מלא מתחילתו ועד ניצחון או הפסד.
>
> **לא** נכללים ב-Milestone זה: Dialog "האם אתה בטוח שברצונך לסיים את המשחק?",
> חסימת ניווט בזמן משחק, עיצוב מלא של ה-HUD ומסך הסיום לפי ה-Mockups, מסכי
> How To Play / About / Home מלאים (כל אלה — M5); שמירת התוצאה ב-localStorage
> ומסך הסטטיסטיקות (M6); Audio, Assets גרפיים סופיים, Sprite Sheet לפיצוצים
> ומשוב חזותי לפגיעה שאינה מחסלת (M7); Responsive, Orientation, PWA ו-Offline (M8).

---

## 0. הקשר ונקודת מוצא

מה שקיים היום (Milestones 1–3 הושלמו):

- `src/game/GameEngine.ts` — `start/stop/destroy/resize/shoot`, `update()` כרצף
  קריאות מסודר, `render()` כרצף ציור מסודר. מחזיק `score` (מספר), `enemies`,
  `projectiles`, `explosions`, ומשדר `GameStats` ל-UI רק כשערך משתנה בפועל.
- `src/game/EnemySpawner.ts` — גל Prototype יחיד מתוך `GAME_CONFIG.prototypeWave`;
  יש כבר `reset()`, `remainingToSpawn`, `isFinished`, `update()`.
- `src/game/Enemy.ts` — `createEnemy`, `updateEnemy`, `applyHit`, `isDestroyed`,
  `hasPassedBottom` (הסרה שקטה — **M3 בלבד**), `getEnemyRadius`, `getHitRadius`,
  `clampEnemyToBounds`.
- `src/game/CollisionManager.ts` — `detectProjectileHits` (Swept circle-segment).
- `src/game/Explosion.ts` — `createExplosion(id, enemy)`, `updateExplosion`,
  `isExplosionFinished`.
- `src/game/Cannon.ts` — מיקום קבוע, `setBounds`, `aimAt`, `update`, `getMuzzlePosition`.
- `src/game/Renderer.ts` — `drawBackground/Enemies/Cannon/Projectiles/Explosions`.
- `src/game/gameConfig.ts` — קבועים; כולל `prototypeWave` (זמני) ו-`colors`.
- `src/types/game.ts` — `Vector2`, `GameBounds`, `Projectile`, `EnemySize`,
  `Enemy`, `Explosion`, `GameStats` (score + enemiesRemaining בלבד).
- `src/hooks/useGameEngine.ts` — יצירת Engine, Resize, Input, Cleanup מלא;
  מחזיק `stats` ב-React State.
- `src/pages/GamePage.tsx` — קורא ל-Hook, מרנדר `GameHud` + כפתור "סיים משחק"
  שמנווט ל-`/`. `GameHud` מציג ניקוד + נותרו אמיתיים, וחיים/שלב **placeholder קבוע**.
- `src/pages/GameOverPage.tsx` — שלד סטטי (ניצחון לדוגמה, ניקוד 0, שלב 1).

M3 תוכנן במפורש כנקודת הרחבה ל-M4 (ראו `spec/plans/milestone-3.md §15`):
`EnemySpawner.reset()` קיים, `prototypeWave` באותה צורה שתהיה ל-`LevelConfig`,
`enemiesRemaining === 0 && spawner.isFinished` הוא בדיוק תנאי Level Complete,
`publishStats()` הוא הנקודה היחידה שמשדרת ל-UI, והסרת האויב שחצה את התחתית היא
השורה היחידה שתוחלף בהתנגשות אויב–תותח. M4 בונה על כל אלה.

אין צורך בשום חשבון, סיסמה או מפתח API עבור Milestone 4 — הכל מקומי.

---

## 1. החלטות טכניות ל-Milestone זה

| נושא | החלטה | נימוק / מקור |
|------|--------|--------------|
| Game Status | הצגת `GameStatus` מלא: `playing` \| `level-complete` \| `player-hit` \| `won` \| `lost` | ARCHITECTURE §8 |
| מכונת מצבים | `GameEngine.update()` מתפצל לפי `status`; רק ב-`playing` יש Spawn/תנועה/Collision | §21 ("עצור זמנית את ה-Game State") |
| חיים | `lives` שדה של המנוע, מתחיל ב-`maxLives = 3`, יורד ב-1 בפגיעה | PRD §4.8, ARCHITECTURE §9 |
| Hit Lock | סטטוס `player-hit` הוא ה-Lock עצמו — כל עוד הוא פעיל אין הורדת חיים נוספת | PRD §4.8, ARCHITECTURE §21 |
| התנגשות אויב–תותח | מעגל פגיעה סביב מרכז התותח (`cannon.hitRadius`) מול מעגל האויב | ARCHITECTURE §21 |
| אויב שמחמיץ את התותח | אויב שחוצה את התחתית **בלי** לגעת בתותח מוסר בשקט (ללא חיים) | ראו החלטה 1 למטה |
| פיצוץ התותח | שימוש חוזר בישות `Explosion` (במיקום התותח, רדיוס/משך גדולים יותר) | ARCHITECTURE §45 — בלי DOM; Sprite אמיתי = M7 |
| Restart Level | ניקוי אויבים/קליעים/פיצוצים + `spawner.reset(config)`; שמירת score/lives/level | ARCHITECTURE §22 |
| Level Configuration | `LEVELS[10]` ב-`gameConfig.ts` בדיוק לפי מבנה `LevelConfig` של §18 | ARCHITECTURE §18 |
| LevelManager | מחלקה דקה שמספקת `getConfig(level)` ואת `totalLevels`; ללא State של המשחק | ARCHITECTURE §3, §18 |
| Randomization | כמות/מהירות/מרווח/סוג מוגרלים בתוך טווחי ה-`LevelConfig` דרך `random.ts` | ARCHITECTURE §19 |
| זיהוי סיום שלב | `spawner.isFinished && enemies.length === 0` בזמן `playing` | ARCHITECTURE §20 |
| הודעת Level Complete | React Overlay מעל ה-Canvas (לא ציור Canvas) | ARCHITECTURE §41, §5 — טקסט UI הוא React |
| השהיות (delay) | Timer מבוסס Delta בתוך הלולאה; **אין** `setTimeout`/`setInterval` | ARCHITECTURE §7 |
| Win | השלמת שלב 10 → `won` (ללא הודעת "שלב 10 הושלם") | PRD §3, §4.11 |
| Loss | איבוד החיים השלישי → `lost` | PRD §4.12, ARCHITECTURE §23 |
| מעבר למסך סיום | `GamePage` מנווט ל-`/game-over` עם `location.state` (result/score/level) | PRD Flow 5+6 |
| שמירת תוצאה | **לא ב-M4** — localStorage וסטטיסטיקות הם M6 | ARCHITECTURE §28, §49 |
| ערוץ ל-UI | `GameStats` מורחב ב-`lives`, `currentLevel`, `status`; אותו `publishStats()` | milestone-3.md §15 |
| קבועים | `maxLives`, `totalLevels`, delays, `cannon.hitRadius`, `LEVELS[]` — הכל ב-config | ARCHITECTURE §62, §63 |

### החלטות שאינן מוגדרות במפורש באף מסמך

לפי `ARCHITECTURE §66.3` ("אם דרישה טכנית אינה מוגדרת בשני המסמכים — לבחור
בפתרון הפשוט ביותר שמתאים ל-MVP"). כולן מתועדות כאן ואינן דורשות עצירה:

1. **אויב שמחמיץ את התותח וחוצה את התחתית.** האויבים מכוונים למרכז התותח עם
   סטייה קטנה בלבד (`maxAimJitter`), אך יתכן שאויב יחמיץ ויצא מהתחתית בצד.
   התנגשות אויב–תותח (§21) בודקת מעגל סביב **מרכז** התותח, ולכן אויב שיצא
   בצד מבלי לגעת בו לא אמור לעלות חיים. החלטה: אויב כזה מוסר בשקט (כמו ב-M3,
   ללא חיים וללא פיצוץ). `hasPassedBottom` נשמר לצורך זה, אך התיעוד שלו מתעדכן.
2. **סדר הבדיקות בפריים.** קודם התנגשות אויב–תותח, ורק אז הסרת אויב שחצה
   תחתית — כדי שאויב שמגיע לתותח יפעיל פגיעה, ולא יימחק בשקט קודם.
3. **הודעת השלמת שלב 10.** אין הודעת "שלב 10 הושלם" — סיום שלב 10 עובר ישירות
   ל-`won` ולמסך הסיום (PRD §3: "השלמת שלב 10 → ניצחון"). לשלבים 1–9 בלבד מוצגת
   ההודעה + מעבר אוטומטי.
4. **העברת התוצאה למסך הסיום.** מועברת דרך `location.state` של React Router.
   ב-Refresh על `/game-over` ה-state אובד — התנהגות מקובלת ל-MVP ותואמת ל-PRD
   ("Refresh מבטל משחק פעיל"). למסך הסיום יתווסף Fallback בטוח: אם אין state,
   מפנים חזרה ל-`/` (אין תוצאה אמיתית להצגה).
5. **גודל אזור הפגיעה של התותח.** `cannon.hitRadius` ברירת מחדל ~קצת יותר מחצי
   רוחב התותח. ניתן לכוונון; משחק לילדים 6–12, אין להעניש על "כמעט".
6. **הקפאה בזמן `player-hit` ו-`level-complete`.** בשני המצבים לא רצים Spawn,
   תנועת אויבים או Collision; רצים רק ה-Timer של הסטטוס ועדכון הפיצוצים
   (כדי שפיצוץ התותח / פיצוצי סיום ייראו). התותח לא מסתובב במצבים אלה.
7. **ערכי `LEVELS`.** הטבלה בסעיף 3.4 היא נקודת פתיחה סבירה לילדים 6–12
   (§18 דורש "קושי סביר"). הערכים ניתנים לכוונון ב-M9 (Slice "כיוונון רמת קושי").

> אם במהלך הבנייה תתעורר סתירה אמיתית שכלל התחומים אינו פותר — **לעצור ולשאול**
> לפי `CLAUDE.md`.

---

## 2. מפת הקבצים (יצירה / שינוי)

**ליצור:**

```text
src/game/LevelManager.ts                    ← גישה ל-LEVELS: getConfig(level), totalLevels
src/components/game-ui/LevelCompleteMessage.tsx  ← Overlay "שלב X הושלם" (React)
src/components/game-ui/LevelCompleteMessage.css
```

**לשנות:**

```text
src/types/game.ts                 ← GameStatus, LevelConfig; הרחבת GameStats (lives, currentLevel, status)
src/game/gameConfig.ts            ← maxLives, totalLevels, delays, cannon.hitRadius, cannonExplosion, LEVELS[10]; הסרת prototypeWave
src/game/EnemySpawner.ts          ← reset(config: LevelConfig); הגרלה מטווחי ה-config; ניתוק מ-prototypeWave
src/game/Enemy.ts                 ← עדכון תיעוד hasPassedBottom (נשאר בשימוש עבור "החמצה")
src/game/CollisionManager.ts      ← detectCannonHit(enemies, cannon) → boolean
src/game/Explosion.ts             ← createExplosionAt(id, x, y, maxRadius, durationSeconds) עבור פיצוץ התותח
src/game/GameEngine.ts            ← מכונת המצבים המלאה: lives, levels, restart, win/loss, hit lock, timers
src/hooks/useGameEngine.ts        ← INITIAL_STATS מורחב (lives/level/status)
src/pages/GamePage.tsx            ← תגובה ל-status: Overlay + ניווט ל-game-over עם state
src/components/game-ui/GameHud.tsx ← HUD מלא: score, lives, currentLevel, enemiesRemaining (הסרת ה-placeholders)
src/pages/GameOverPage.tsx        ← קריאת location.state → ניצחון/הפסד/ניקוד/שלב + Fallback
spec/MILESTONES.md                ← סימון Slices 1–12 של M4 כ-✅ תוך כדי העבודה
```

**לא לגעת ב-M4:** `GameLoop.ts`, `Cannon.ts` (מלבד קריאה ל-`hitRadius` מ-config —
ההתנגשות עצמה ב-CollisionManager), `Projectile.ts`, `Renderer.ts` (הפיצוץ הקיים
משרת גם את פיצוץ התותח), `App.tsx`, `Navigation`, `HomePage/About/HowToPlay/
Statistics`, `styles/`.

> הערה: כפתור "סיים משחק" הקיים ב-`GamePage` נשאר כפי שהוא (מנווט ל-`/`).
> ה-Dialog לאישור, חסימת הניווט ועיצוב ה-HUD/מסך הסיום לפי ה-Mockups — **M5**.

---

## 3. Types ו-Config

### 3.1 `src/types/game.ts` — תוספות

```ts
/** מקור: spec/ARCHITECTURE.md §8. */
export type GameStatus =
  | 'playing'        // משחק פעיל רגיל
  | 'level-complete' // כל אויבי השלב חוסלו — מציגים הודעה, ממתינים לפני מעבר
  | 'player-hit'     // אויב פגע בתותח — Hit Lock פעיל, פיצוץ התותח מתנגן
  | 'won'            // הושלם שלב 10
  | 'lost';          // אבד החיים השלישי

/** מקור: spec/ARCHITECTURE.md §18. טווחים בלבד — הערכים בפועל מוגרלים בתוכם. */
export interface LevelConfig {
  level: number;
  enemyCountMin: number;
  enemyCountMax: number;
  spawnIntervalMinSeconds: number;
  spawnIntervalMaxSeconds: number;
  enemySpeedMin: number;
  enemySpeedMax: number;
  smallProbability: number;
  mediumProbability: number;
  largeProbability: number;
}
```

הרחבת `GameStats` (הערוץ היחיד ל-UI — milestone-3.md §15):

```ts
export interface GameStats {
  score: number;
  lives: number;          // חדש
  currentLevel: number;   // חדש
  enemiesRemaining: number;
  status: GameStatus;     // חדש
}
```

> `GameState` המלא של §8 (עם `enemies[]`/`projectiles[]`) **אינו** נוצר כ-Type
> נפרד — האובייקטים חיים כשדות פרטיים של ה-Engine, ו-`GameStats` הוא ההיטל
> ל-UI. אין ליצור Type שאינו בשימוש (ARCHITECTURE §61).

### 3.2 `src/game/gameConfig.ts` — תוספות

```ts
  /** ARCHITECTURE §63. */
  maxLives: 3,
  totalLevels: 10,

  /** משך הצגת "שלב X הושלם" לפני מעבר אוטומטי (ARCHITECTURE §63). */
  levelCompleteDelaySeconds: 1.2,
  /** משך אנימציית פיצוץ התותח לפני Restart/Loss (ARCHITECTURE §63). */
  cannonExplosionDurationSeconds: 0.8,
```

לבלוק `cannon` הקיים נוסף:

```ts
    /** רדיוס אזור הפגיעה של התותח לצורך התנגשות אויב–תותח (§1, החלטה 5). */
    hitRadius: 30,
```

בלוק חדש לפיצוץ התותח (משתמש חוזר ב-Renderer הקיים, בגדלים גדולים יותר):

```ts
  cannonExplosion: {
    /** רדיוס השיא של פיצוץ התותח, ב-px. */
    maxRadius: 90,
  },
```

**הסרה:** בלוק `prototypeWave` כולו (הוחלף ב-`LEVELS`, ראו §3.4). יש לוודא
שאין יבוא נותר שלו (ב-`EnemySpawner.ts`).

### 3.3 מבנה `LEVELS` והיכן הוא יושב

`LEVELS: readonly LevelConfig[]` יוגדר ב-`gameConfig.ts` (Configuration שייך
לשם, §63). `LevelManager` צורך אותו ולא מחזיק נתונים משלו. סכום שלוש
ההסתברויות בכל שורה = 1 (ARCHITECTURE §17, §19).

### 3.4 טבלת `LEVELS` (נקודת פתיחה — ניתנת לכוונון ב-M9)

| level | count | interval (s) | speed (px/s) | small / med / large |
|------:|:-----:|:------------:|:------------:|:-------------------:|
| 1 | 4–6   | 1.6–2.4 | 30–45 | 0.70 / 0.25 / 0.05 |
| 2 | 5–7   | 1.5–2.2 | 32–48 | 0.65 / 0.28 / 0.07 |
| 3 | 6–9   | 1.4–2.1 | 35–52 | 0.60 / 0.30 / 0.10 |
| 4 | 8–11  | 1.3–1.9 | 38–56 | 0.55 / 0.32 / 0.13 |
| 5 | 9–13  | 1.2–1.8 | 42–60 | 0.50 / 0.35 / 0.15 |
| 6 | 11–15 | 1.1–1.7 | 45–65 | 0.45 / 0.37 / 0.18 |
| 7 | 12–17 | 1.0–1.6 | 48–70 | 0.40 / 0.38 / 0.22 |
| 8 | 14–19 | 0.9–1.5 | 52–75 | 0.35 / 0.40 / 0.25 |
| 9 | 16–21 | 0.8–1.4 | 55–80 | 0.32 / 0.40 / 0.28 |
| 10| 18–24 | 0.7–1.3 | 60–88 | 0.30 / 0.40 / 0.30 |

הקושי עולה בהדרגה בארבעה צירים במקביל (§4.9): יותר אויבים, מרווחים קצרים יותר,
מהירות גבוהה יותר ויותר אויבים חזקים — מבלי להפוך את שלב 10 לקיצוני (§4.9).

---

## 4. Slice 6+7 — Level Configuration ו-Randomization מבוקר

`src/game/LevelManager.ts` — מחלקה דקה, ללא State של משחק:

```ts
export class LevelManager {
  get totalLevels(): number            // = GAME_CONFIG.totalLevels
  getConfig(level: number): LevelConfig // מחזיר את LEVELS[level - 1], עם Clamp הגנתי
  isLastLevel(level: number): boolean   // level >= totalLevels
}
```

`EnemySpawner` משתנה כך שיקבל `LevelConfig` ב-`reset()` במקום לקרוא ל-`prototypeWave`:

```ts
reset(config: LevelConfig): void {
  this.config = config;
  this.plannedCount = randomInt(config.enemyCountMin, config.enemyCountMax); // §19
  this.spawnedCount = 0;
  this.timeUntilNextSpawnSeconds = FIRST_SPAWN_DELAY_SECONDS; // קבוע קטן ב-config
}
```

- `plannedCount` מוגרל **פעם אחת** לכל הפעלת שלב מתוך `[countMin, countMax]` —
  לכן אותו שלב נראה שונה בין משחקים אך נשאר באותה רמה (§19).
- `spawnOne()` מגריל סוג לפי `[small/medium/large]Probability` של ה-config
  הנוכחי, ומהירות מתוך `[speedMin, speedMax]` — במקום הקבועים של `prototypeWave`.
- מרווח ה-Spawn הבא מוגרל מתוך `[spawnIntervalMin, spawnIntervalMax]` של ה-config.
- ה-API החיצוני (`remainingToSpawn`, `isFinished`, `update()`) **נשאר זהה** —
  ה-Engine כמעט לא משתנה בנקודות אלה.

`random.ts` כבר כולל `randomRange`, `randomInt`, `pickWeighted` — אין תוספת.

---

## 5. Slice 8+9 — זיהוי השלמת שלב, הודעה ומעבר אוטומטי

בתוך `updatePlaying()` (הענף של `status === 'playing'`), אחרי סינון האויבים:

```ts
if (this.spawner.isFinished && this.enemies.length === 0) {
  if (this.levels.isLastLevel(this.currentLevel)) {
    this.enterWon();                 // §3, החלטה 3 — שלב 10 → ניצחון ישיר
  } else {
    this.enterStatus('level-complete');
    this.statusTimerSeconds = 0;
  }
}
```

ענף `level-complete` ב-`update()`:

```ts
this.statusTimerSeconds += deltaSeconds;
this.updateExplosions(deltaSeconds);     // כדי שפיצוץ אחרון של אויב ידעך יפה
if (this.statusTimerSeconds >= GAME_CONFIG.levelCompleteDelaySeconds) {
  this.advanceToNextLevel();
}
```

`advanceToNextLevel()`:

```ts
this.currentLevel += 1;
this.startLevel(this.currentLevel);      // ראו §7
this.enterStatus('playing');
```

**הודעת "שלב X הושלם"** — `LevelCompleteMessage.tsx`, Overlay מוחלט מעל ה-Canvas.
`GamePage` מרנדר אותו כאשר `stats.status === 'level-complete'`, עם הטקסט
`שלב ${stats.currentLevel} הושלם` (בזמן `level-complete` עדיין לא הוקדם ה-level,
ולכן `currentLevel` הוא השלב שהושלם). עיצוב בסיסי קריא לפי `DESIGN.md` (Rubik,
צבעי Style Guide); Polish של המעבר — M7 Slice 11.

---

## 6. Slice 1+3+4 — התנגשות אויב–תותח, Hit Lock, פיצוץ התותח

`src/game/CollisionManager.ts` — פונקציה חדשה:

```ts
/** האם אויב פעיל כלשהו נוגע באזור הפגיעה של התותח (§21). */
export function detectCannonHit(
  enemies: readonly Enemy[],
  cannon: { x: number; y: number },
  cannonHitRadius: number,
): boolean
```

בדיקה: לכל אויב פעיל, `hypot(enemy.x - cannon.x, enemy.y - cannon.y)
<= cannonHitRadius + getHitRadius(enemy.size)`. מספיק `true` אחד — Hit Lock
מוריד חיים אחד בלבד ללא קשר לכמות (PRD §4.8, ARCHITECTURE §21).

בתוך `updatePlaying()`, **לפני** הסרת אויבים שחצו את התחתית (§1, החלטה 2):

```ts
if (detectCannonHit(this.enemies, this.cannon, GAME_CONFIG.cannon.hitRadius)) {
  this.enterPlayerHit();
  return;   // שאר הרצף של הפריים נעצר — נכנסים למצב player-hit
}
```

`enterPlayerHit()`:

```ts
this.lives -= 1;                                   // Slice 2 — הורדת חיים אחת
this.explosions.push(
  createExplosionAt(id, this.cannon.x, this.cannon.y,
    GAME_CONFIG.cannonExplosion.maxRadius,
    GAME_CONFIG.cannonExplosionDurationSeconds),  // Slice 4 — פיצוץ התותח
);
this.enterStatus('player-hit');                    // Slice 3 — ה-Lock עצמו
this.statusTimerSeconds = 0;
```

ענף `player-hit` ב-`update()`:

```ts
this.statusTimerSeconds += deltaSeconds;
this.updateExplosions(deltaSeconds);   // הפיצוץ מתנגן; אין Spawn/תנועה/Collision
if (this.statusTimerSeconds >= GAME_CONFIG.cannonExplosionDurationSeconds) {
  if (this.lives > 0) {
    this.restartLevel();               // Slice 5
    this.enterStatus('playing');
  } else {
    this.enterLost();                  // Slice 11
  }
}
```

מכיוון שכל תנועת האויבים והבדיקות מוקפאות ב-`player-hit`, שום אויב "שני" אינו
יכול לפגוע — זהו מימוש ה-Hit Lock (§21). `createExplosionAt` נוסף ל-`Explosion.ts`
לצד `createExplosion(id, enemy)` הקיים (הקיים ייגזר ממנו).

**ציור:** בזמן `player-hit` לא מציירים את התותח (הוא "התפוצץ"); הפיצוץ מצויר
במקומו דרך `drawExplosions` הקיים. עם ה-Restart התותח חוזר להיראות. שינוי קטן
ב-`render()`: לדלג על `drawCannon` כאשר `status === 'player-hit'`.

---

## 7. Slice 5 — Restart של השלב, ותחילת שלב

`GameEngine.restartLevel()` (ARCHITECTURE §22):

```ts
this.enemies = [];
this.projectiles = [];
this.explosions = [];
this.spawner.reset(this.levels.getConfig(this.currentLevel));
// לא לאפס: score, lives, currentLevel
```

`GameEngine.startLevel(level)` — משמש גם במעבר שלב וגם בתחילת משחק חדש:

```ts
this.currentLevel = level;
this.enemies = [];
this.projectiles = [];
this.explosions = [];
this.spawner.reset(this.levels.getConfig(level));
```

ההבדל בין `restartLevel` ל-`startLevel(currentLevel)` זניח (שניהם מנקים ומאתחלים
את אותו שלב) — אפשר לממש את `restartLevel` כ-`startLevel(this.currentLevel)`.
נשמרת פונקציה בשם `restartLevel` לצורך קריאוּת ולתאימות עם `§52`
(`restartLevel()` מופיע ב-Game Engine Lifecycle).

**משחק חדש** מאותחל ב-constructor של ה-Engine (כמו היום — GamePage יוצר Engine
חדש בכל mount): `score = 0`, `lives = maxLives`, `startLevel(1)`, `status = 'playing'`.

---

## 8. Slice 10+11 — Win / Loss והמעבר למסך הסיום

`enterWon()` / `enterLost()`:

```ts
enterWon()  { this.enterStatus('won');  this.loop.stop(); }
enterLost() { this.enterStatus('lost'); this.loop.stop(); }
```

עצירת הלולאה מיד מונעת פריימים מיותרים עד שה-React מנווט. `publishStats()` נקרא
פעם אחת עם ה-status הסופי (ראו §9) לפני העצירה, כדי שה-UI יקבל את המעבר.

`GamePage` מגיב ל-`status`:

```ts
useEffect(() => {
  if (stats.status === 'won' || stats.status === 'lost') {
    navigate(ROUTES.gameOver, {
      replace: true,
      state: {
        result: stats.status === 'won' ? 'win' : 'loss',
        finalScore: stats.score,
        levelReached: stats.currentLevel,
      },
    });
  }
}, [stats.status, stats.score, stats.currentLevel, navigate]);
```

`replace: true` — כדי שכפתור "אחורה" לא יחזיר למסך משחק מת. עם הניווט GamePage
מתפרק → `engine.destroy()` (Cleanup מלא, ARCHITECTURE §53).

`GameOverPage` (Slice המשלים למעבר — הצגה בלבד, בלי localStorage):

```ts
const location = useLocation();
const state = location.state as
  | { result: 'win' | 'loss'; finalScore: number; levelReached: number }
  | null;

if (!state) return <Navigate to={ROUTES.home} replace />;  // §1, החלטה 4 — Fallback
```

מוצג: אייקון + כותרת "ניצחון!" / "הפסד" לפי `state.result`, `finalScore`,
`levelReached`, וכפתור "משחק חדש" (הקישור הקיים ל-`ROUTES.game` — יוצר Engine
חדש = שלב 1 / 3 חיים / 0 נקודות). עיצוב מלא לפי ה-Mockups ושמירת התוצאה
בסטטיסטיקות — **M5 ו-M6 בהתאמה**.

---

## 9. Slice 12 — HUD מלא, ומכונת המצבים ב-`GameEngine`

### 9.1 `publishStats()` מורחב

```ts
private publishStats(): void {
  const enemiesRemaining = this.spawner.remainingToSpawn + this.enemies.length;
  const next: GameStats = {
    score: this.score,
    lives: this.lives,
    currentLevel: this.currentLevel,
    enemiesRemaining,
    status: this.status,
  };
  if (statsEqual(next, this.stats)) return;   // אין setState מיותר (§54)
  this.stats = next;
  this.onStatsChange?.(next);
}
```

`statsEqual` משווה את חמשת השדות. `destroy()` ממשיך לאפס `onStatsChange = null`.

### 9.2 `GameHud` — ארבעת הפריטים, כולם אמיתיים

| פריט | מקור ב-M4 |
|------|-----------|
| ⭐ ניקוד | `props.score` |
| ❤️ חיים | `props.lives` |
| 🚀 שלב | `props.currentLevel` |
| 👾 נותרו | `props.enemiesRemaining` |

ה-placeholders הקבועים (`3`, `1`) וההערות `// M4` **מוסרים**. `useGameEngine`
מעדכן את `INITIAL_STATS` ל-`{ score: 0, lives: GAME_CONFIG.maxLives,
currentLevel: 1, enemiesRemaining: 0, status: 'playing' }`. עיצוב מלא של ה-HUD
לפי ה-Mockups + Sound Toggle — **M5 Slice 2**.

### 9.3 סדר `update()` ו-`render()` המלא

`update(deltaSeconds)` — מכונת מצבים:

```text
switch (status):
  playing:        updatePlaying(dt)      // הרצף של M3 + התנגשות תותח + זיהוי סיום שלב
  level-complete: statusTimer += dt; updateExplosions; אם עבר הזמן → advanceToNextLevel
  player-hit:     statusTimer += dt; updateExplosions; אם עבר הזמן → restart / lost
  won | lost:     (הלולאה כבר נעצרה)
publishStats()
```

`updatePlaying(dt)` — הרחבת רצף M3 (ARCHITECTURE §7):

```text
1. cannon.update(dt)
2. spawner.update(dt, bounds, cannonPos) → push לאויבים
3. לכל אויב: updateEnemy(dt)
4. detectCannonHit → אם כן: enterPlayerHit(); return          ← חדש (§21)
5. לכל אויב: אם hasPassedBottom → active = false (החמצה, §1)  ← אחרי בדיקת התותח
6. לכל קליע: updateProjectile(dt) + isOutOfBounds
7. detectProjectileHits → applyHit / חיסול / score / explosion
8. סינון אויבים וקליעים לא פעילים
9. updateExplosions(dt) + סינון שהסתיימו
10. אם spawner.isFinished && enemies ריק → level-complete / won   ← חדש (§20)
```

`render()` — סדר שכבות (כמו M3), עם דילוג על התותח בזמן פיצוצו:

```text
drawBackground → drawEnemies → (drawCannon אם status !== 'player-hit') → drawProjectiles → drawExplosions
```

`resize()` — ללא שינוי מהותי (עדיין `clampEnemyToBounds` לכל אויב פעיל).

---

## 10. תוכנית בדיקה ידנית ל-Milestone 4

| # | תרחיש | תוצאה מצופה |
|---|--------|--------------|
| 1 | פתיחת `/game` | HUD מציג ניקוד 0, חיים 3, שלב 1, ונותרו לפי שלב 1 |
| 2 | חיסול כל אויבי שלב 1 | מופיעה הודעת "שלב 1 הושלם"; אחרי ~1.2ש' עוברים לשלב 2 |
| 3 | מעבר שלב | ה-HUD מציג "שלב: 2"; חיים וניקוד נשמרו; אויבים חדשים לפי שלב 2 |
| 4 | השוואת שני משחקים באותו שלב | הרכב/מיקום/מהירות שונים מעט, אך רמת הקושי דומה |
| 5 | עליית קושי | שלבים גבוהים = יותר אויבים, מהר יותר, יותר אויבים גדולים |
| 6 | לתת לאויב להגיע לתותח | התותח מתפוצץ; חיים יורדים ב-1; המסך "קופא" למשך הפיצוץ |
| 7 | אחרי פיצוץ (חיים>0) | אותו שלב מתחיל מחדש מ-0 אויבים; ניקוד נשמר; חיים = הנותר |
| 8 | כמה אויבים מגיעים יחד לתותח | יורד **חיים אחד בלבד**; פיצוץ אחד (Hit Lock) |
| 9 | אויב שמחמיץ ויוצא בצד התחתית | נעלם בשקט; אין הורדת חיים; אין פיצוץ תותח |
| 10 | איבוד חיים ראשון ושני | ממשיכים לשחק; ה-HUD מציג 2 ואז 1 |
| 11 | איבוד החיים השלישי | מעבר למסך סיום עם "הפסד", הניקוד והשלב הנכונים |
| 12 | השלמת שלב 10 | מעבר ישיר למסך סיום עם "ניצחון" (ללא הודעת "שלב 10 הושלם") |
| 13 | מסך סיום — "משחק חדש" | משחק חדש: שלב 1, חיים 3, ניקוד 0 |
| 14 | ניקוד לאורך השלבים | אינו מתאפס במעבר שלב ולא באיבוד חיים (PRD §4.7) |
| 15 | כניסה ישירה ל-`/game-over` (ללא state) | הפניה בטוחה חזרה ל-`/` (אין קריסה) |
| 16 | ירי בזמן "שלב X הושלם" / פיצוץ תותח | אין תגובה (המשחק מוקפא); אין קליעים חדשים |
| 17 | שינוי גודל חלון באמצע שלב | אויבים בתוך הגבולות; ניקוד/חיים/שלב נשמרים; אין קריסה |
| 18 | יציאה ל-`/` בזמן משחק וחזרה | Engine חדש; שלב 1 מ-0; אין כפילות (StrictMode) |
| 19 | React DevTools → Profiler | אין Re-render לכל Frame; רק בשינוי ניקוד/חיים/שלב/נותרו/status |
| 20 | Console בזמן משחק מלא עד ניצחון/הפסד | אין שגיאות; אין Game Loop שנשאר פעיל אחרי מעבר מסך |
| 21 | `npm run build` | עובר; אפס שגיאות TypeScript; אין `any` |
| 22 | `npm run lint` | עובר נקי |

---

## 11. Definition of Done ל-Milestone 4

מתוך `MILESTONES.md` + דרישות הקוד מ-`ARCHITECTURE §61`:

- [ ] המשחק מתחיל בשלב 1 עם 3 חיים ו-0 נקודות.
- [ ] קיימים 10 שלבים עם קושי עולה בהדרגה (אויבים/מהירות/צפיפות/סוגים).
- [ ] אותו שלב שונה מעט בין משחקים אך נשאר באותה רמת קושי (Randomization מבוקר).
- [ ] אויב המגיע לתותח מפעיל פיצוץ תותח ומוריד חיים אחד.
- [ ] כמה אויבים שפוגעים כמעט יחד מורידים **חיים אחד בלבד** (Hit Lock).
- [ ] לאחר פגיעה (חיים>0) השלב הנוכחי מתחיל מחדש; Score, Lives ו-Level נשמרים.
- [ ] השלמת כל אויבי השלב מזוהה נכון ומציגה "שלב X הושלם".
- [ ] מעבר אוטומטי לשלב הבא אחרי ההודעה, ללא אינטראקציה.
- [ ] השלמת שלב 10 → מסך סיום "ניצחון".
- [ ] איבוד החיים השלישי → מסך סיום "הפסד".
- [ ] מסך הסיום מציג את התוצאה, הניקוד הסופי והשלב הנכונים.
- [ ] "משחק חדש" מתחיל משחק נקי (שלב 1, 3 חיים, 0 נקודות).
- [ ] ה-HUD מציג ניקוד, חיים, שלב ואויבים שנותרו — כולם אמיתיים ובזמן אמת.
- [ ] React אינו מבצע Re-render בכל Frame; אובייקטי משחק אינם ב-React State.
- [ ] `src/game/` עדיין אינו מייבא React.
- [ ] Cleanup מלא ביציאה מהמסך; אין Game Loop פעיל אחרי מעבר מסך.
- [ ] אין שמירה ל-localStorage ב-M4 (נשאר ל-M6).
- [ ] `npm run build` ו-`npm run lint` עוברים ללא שגיאות; אין `any`.
- [ ] אין Console Errors בשימוש רגיל.
- [ ] כל Slices 1–12 של Milestone 4 מסומנים ✅ ב-`spec/MILESTONES.md`.

---

## 12. הכנה ל-Milestone 5 (לא לממש עכשיו)

הפרדות שכדאי לשמור ב-M4 כדי ש-M5 (UI מלא + Flows) יתחבר בלי שכתוב —
**בלי** לכתוב קוד עבורן עכשיו:

- כפתור "סיים משחק" נשאר ב-`GamePage`; M5 יעטוף אותו ב-Confirmation Dialog
  ("האם אתה בטוח…") במקום ניווט ישיר.
- `status === 'playing'` הוא הסימן ש-M5 ישתמש בו לחסימת הניווט בזמן משחק.
- `GameHud` מקבל את כל הנתונים כ-props; M5 יוסיף לו רק Sound Toggle ועיצוב Mockups.
- `GameOverPage` כבר קורא את התוצאה מ-`location.state`; M5 יעצב אותו לפי ה-Mockups
  ו-M6 יוסיף את שמירת התוצאה ב-localStorage **לפני** הניווט (ב-`GamePage`).
- `LevelCompleteMessage` הוא רכיב נפרד; Polish של המעבר יגיע ב-M7 Slice 11.

---

## 13. עצירות ונקודות אישור (לפי `CLAUDE.md`)

- **לא לבצע `git commit` ולא deploy** בלי אישור מפורש מהמפתח.
- אין צורך בחשבונות/מפתחות ל-M4 — אם בכל זאת יתעורר צורך, **לעצור ולשאול**.
- בסיום Milestone 4 — **לעצור ולהמתין לבדיקת המפתח** לפני מעבר ל-Milestone 5.
- כל סתירה אמיתית בין מסמכים שאינה נפתרת בכלל התחום → **לשאול לפני החלטה**.
