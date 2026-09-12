# Milestone 2 – Core Game Prototype — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 2** מתוך `spec/MILESTONES.md`.
> מטרה: Prototype עובד של אזור המשחק — Canvas חד, Game Loop מבוסס Delta Time,
> רקע חלל עם כוכבים, תותח קבוע בתחתית שמסתובב לכיוון הלחיצה, וקליע לייזר אחד
> לכל לחיצה שנע לעבר נקודת הלחיצה ונעלם בגבולות אזור המשחק.
>
> **לא** נכללים ב-Milestone זה: אויבים, Spawner, Collision Detection, ניקוד, חיים,
> שלבים, Win/Loss, אנימציות פיצוץ, Audio, localStorage, Dialog "סיים משחק",
> חסימת ניווט, Assets גרפיים סופיים, PWA — אלו שייכים ל-Milestones 3–9.

---

## 0. הקשר ונקודת מוצא

מה שקיים היום (Milestone 1 הושלם):

- Vite + React 19 + TypeScript, `strict: true`, `npm run dev/build/lint`.
- Routing מלא ב-`src/App.tsx` + `Navigation` + RTL + `styles/variables.css`.
- `src/pages/GamePage.tsx` — **שלד בלבד**: HUD placeholder סטטי (`aria-hidden`),
  `div.game-page__canvas-placeholder` עם טקסט "אזור המשחק (Canvas) יתווסף
  ב-Milestone הבא", וכפתור "סיים משחק" שמנווט ל-`/`.
- `src/game/`, `src/hooks/`, `src/components/game-ui/` — ריקות (`.gitkeep` בלבד).

ב-Milestone 2 מחליפים את ה-placeholder ב-Canvas אמיתי המחובר ל-Game Engine.
ה-HUD נשאר placeholder סטטי (הערכים האמיתיים — M3/M4), וכפתור "סיים משחק" נשאר
כפי שהוא (Dialog האישור — M5).

אין צורך בשום חשבון, סיסמה או מפתח API עבור Milestone 2 — הכל מקומי.

---

## 1. החלטות טכניות ל-Milestone זה

כל ההחלטות הבאות נופלות בתחום הטכנולוגי (`ARCHITECTURE.md` מנצח) ונבחר בהן הפתרון
הפשוט ביותר המתאים ל-MVP:

| נושא | החלטה | נימוק |
|------|--------|--------|
| הפרדת מנוע מ-React | `src/game/*` — **TypeScript טהור, אפס imports מ-React** | ARCHITECTURE §2, §51 |
| חיבור React↔מנוע | Hook יחיד `useGameEngine` + רכיב `GameCanvas` | §51: React רק מפעיל/עוצר ומקבל עדכונים |
| יחידות עבודה | כל הלוגיקה והציור ב-**CSS Pixels**; ה-DPR מיושם פעם אחת ב-`ctx.setTransform` | מונע פיזור חישובי DPR בכל הקוד |
| מהירות | פיקסלים **לשנייה** (px/s), מוכפל ב-`deltaSeconds` | §7 — תנועה בלתי תלויה ב-FPS |
| Input | **Pointer Events** (`pointerdown`) | אירוע אחד שמכסה Mouse + Touch (§11), בלי כפילות `click`+`touchstart` |
| Resize | **`ResizeObserver`** על ה-container (לא `orientationchange`) | §36 — להגיב לשינוי גודל בפועל |
| כוכבים | מערך נוצר פעם אחת לכל Resize, מצויר בכל Frame | §44 — רקע סטטי, ~120 עיגולים = זניח |
| ציור התותח/הקליע | צורות Canvas וקטוריות (Gradient/Glow) | Assets אמיתיים = M7 §42; אין תלות ב-Assets עכשיו |
| קבועים | **הכל** ב-`src/game/gameConfig.ts` | §62, §63 — אין Magic Numbers בקוד |
| State של React | **לא** מחזיק אובייקטי משחק | §54 — אין Re-render לכל Frame |

### שתי החלטות שאינן מוגדרות במפורש באף מסמך

לפי `ARCHITECTURE.md §66.3` ("אם דרישה טכנית אינה מוגדרת בשני המסמכים — לבחור בפתרון
הפשוט ביותר שמתאים ל-MVP"). שתיהן מתועדות כאן ולא דורשות עצירה:

1. **טווח סיבוב התותח:** התותח יוגבל לכיוון מעלה בלבד — זווית ב-`[-π, 0]`
   (לחיצה מתחת לקו התותח תיצמד לאופק). התותח יושב בתחתית המסך ואויבים מגיעים
   מלמעלה בלבד (PRD §4.6), כך שירי כלפי מטה חסר משמעות ונראה שבור.
2. **מגבלת קליעים פעילים:** `maxActiveProjectiles` (ברירת מחדל 40) — לחיצות
   מהירות מאוד של ילד לא יציפו את המערכת. אין "reload" ואין מגבלת תחמושת
   (PRD §4.4) — זו הגנת ביצועים בלבד והמספר מספיק גבוה כדי שלא יורגש.

> אם במהלך הבנייה תתעורר סתירה אמיתית שכלל התחומים אינו פותר — **לעצור ולשאול**
> לפי `CLAUDE.md`.

---

## 2. מפת הקבצים (יצירה / שינוי)

**ליצור:**

```text
src/types/game.ts                      ← Types משותפים (Vector2, Projectile, CannonState...)
src/game/gameConfig.ts                 ← כל הקבועים של M2
src/game/GameLoop.ts                   ← rAF + Delta Time (מחלקה גנרית)
src/game/Cannon.ts                     ← מיקום, זווית, נקודת יציאת הקליע (muzzle)
src/game/Projectile.ts                 ← יצירה + עדכון + בדיקת גבולות
src/game/Renderer.ts                   ← כל הציור ל-Canvas (רקע, כוכבים, תותח, קליעים)
src/game/GameEngine.ts                 ← Orchestration: start/stop/destroy/resize/shoot
src/hooks/useGameEngine.ts             ← גשר React↔Engine (יצירה, ניקוי, Resize, Input)
src/components/game-ui/GameCanvas.tsx  ← רכיב React עוטף ל-<canvas>
src/components/game-ui/GameCanvas.css
```

**לשנות:**

```text
src/pages/GamePage.tsx   ← להחליף את ה-placeholder ב-<GameCanvas />
src/pages/GamePage.css   ← אזור המשחק ממלא את הגובה הזמין; מניעת Scroll/Gestures
spec/MILESTONES.md       ← לסמן ✅ לכל Slice ולכל Definition of Done תוך כדי עבודה
```

**למחוק:** `src/game/.gitkeep`, `src/hooks/.gitkeep`, `src/components/game-ui/.gitkeep`
(התיקיות כבר מכילות קוד).

---

## 3. `src/types/game.ts` + `src/game/gameConfig.ts`

### 3.1 Types (M2 בלבד — Enemy/GameState נוספים ב-M3/M4)

```ts
export interface Vector2 { x: number; y: number }

/** מידות אזור המשחק ב-CSS Pixels */
export interface GameBounds { width: number; height: number }

/** ARCHITECTURE §12 */
export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
}
```

`radius` של הקליע מגיע מה-config ולא נשמר פר-אובייקט (זהה לכולם).

### 3.2 `gameConfig.ts`

מבנה בהתאם ל-`ARCHITECTURE §63`, עם **רק** מה ש-M2 צורך. שדות של M3/M4
(`maxLives`, `enemyTypes`, `levels`...) **לא** נוספים עכשיו — הם יתווספו באותם
Milestones כדי שלא יהיה Dead Code (§61).

```ts
export const GAME_CONFIG = {
  /** Delta מקסימלי לפריים — מונע "קפיצה" אחרי Tab לא פעיל */
  maxDeltaSeconds: 0.05,

  projectile: {
    speed: 900,            // px/s — ARCHITECTURE §63
    radius: 4,
    trailLength: 18,       // אורך שובל הזוהר ב-px
    maxActive: 40,
  },

  cannon: {
    width: 54,
    height: 64,
    bottomMargin: 12,      // מרחק מתחתית אזור המשחק
    muzzleOffset: 34,      // מרחק ממרכז הסיבוב לקצה הקנה
    minAngle: -Math.PI,    // שמאלה-אופקית
    maxAngle: 0,           // ימינה-אופקית (0 = כלפי מעלה לאחר ההיסט)
    rotationLerp: 18,      // חלקות סיבוב לשנייה; 0 = הצמדה מיידית
  },

  background: {
    starCount: 120,
    starMinRadius: 0.6,
    starMaxRadius: 1.8,
    starMinAlpha: 0.35,
    starMaxAlpha: 0.95,
  },

  /** צבעים מתוך DESIGN.md — Canvas אינו קורא CSS Variables */
  colors: {
    background: '#0B1026',
    star: '#F8FAFF',
    cannonBody: '#9B5CFF',
    cannonAccent: '#00E5FF',
    projectile: '#FF6BFF',
    projectileGlow: '#9B5CFF',
  },
} as const;
```

> `colors` משוכפל מ-`variables.css` בכוונה — Canvas לא יכול לצרוך CSS Variables
> ישירות. זו כפילות זהה של ערכים, שהיא מותרת לפי `CLAUDE.md`. יש להשאיר הערה בקוד
> שמצביעה על `spec/DESIGN.md` כמקור האמת.

---

## 4. Slice 1+2 — Canvas + devicePixelRatio

### 4.1 `GameCanvas.tsx`

```tsx
<div className="game-canvas" ref={containerRef}>
  <canvas ref={canvasRef} className="game-canvas__el" />
</div>
```

- ה-`div` הוא **מודד הגודל** (ה-`ResizeObserver` מאזין לו), ה-`canvas` ממלא אותו
  ב-`width: 100%; height: 100%; display: block`.
- `aria-hidden` לא מתאים כאן; במקום זה `role="img"` + `aria-label="אזור המשחק"`
  (ARCHITECTURE §55). אין תוכן טקסטואלי מתחלף ב-M2.

### 4.2 CSS (`GameCanvas.css`)

```css
.game-canvas {
  flex: 1;                     /* ממלא את הגובה שנותר ב-GamePage */
  width: 100%;
  min-height: 240px;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  touch-action: none;          /* מונע Scroll/Zoom/Gestures באזור המשחק */
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

`touch-action: none` הוא הפריט הקריטי — בלעדיו נגיעה במובייל תגלול את הדף במקום
לירות. (מופיע כדרישה מלאה ב-M8 Slice 5, אבל בלי זה ה-Prototype לא ניתן לבדיקה
במובייל, ולכן נכלל כאן.)

ב-`GamePage.css` יש לוודא ש-`.game-page` הוא `display: flex; flex-direction: column`
עם גובה זמין אמיתי, ושה-`canvas-placeholder` הישן מוסר.

### 4.3 התאמת DPR (`GameEngine.resize()`)

```text
const dpr = Math.min(window.devicePixelRatio || 1, 2)   // תקרה של 2 לביצועים במובייל
canvas.width  = Math.round(cssWidth  * dpr)
canvas.height = Math.round(cssHeight * dpr)
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)   // כל הציור מכאן ואילך ב-CSS px
```

לאחר Resize יש לעדכן (§36): `bounds`, מיקום התותח, ומערך הכוכבים.
קליעים פעילים נשארים כפי שהם ב-M2 (אין עדיין Score/Lives לשמר; §35 מתייחס למשחק
מלא — ייבדק שוב ב-M8 Slice 4).

**אימות Slice:** ה-Canvas ממלא את האזור; קווים וטקסט חדים במסך Retina / בזום 200%;
שינוי גודל חלון אינו מותח או מעוות את התמונה.

---

## 5. Slice 3 — Game Loop

`src/game/GameLoop.ts` — מחלקה קטנה וגנרית:

```ts
export class GameLoop {
  constructor(private readonly onFrame: (deltaSeconds: number) => void) {}
  start(): void   // אם כבר רץ — לא לפתוח rAF שני
  stop(): void    // cancelAnimationFrame + איפוס ה-id וה-lastTime
  get isRunning(): boolean
}
```

- הפריים הראשון לאחר `start()` מקבל `deltaSeconds = 0` (אין `lastTime` קודם).
- `deltaSeconds = Math.min((now - lastTime) / 1000, GAME_CONFIG.maxDeltaSeconds)`.
- `stop()` חייב להיות **אידמפוטנטי** — קריאה כפולה לא זורקת ולא משאירה rAF תלוי.

ב-`GameEngine` הסדר בכל Frame לפי `ARCHITECTURE §7` (החלקים של M3/M4 עדיין ריקים):

```text
update(delta) → סיבוב התותח → תנועת קליעים → הסרת קליעים לא פעילים → render()
```

**אימות Slice:** הוספת `console.log` זמני של FPS מראה ~60; מעבר ללשונית אחרת
וחזרה אינו גורם לקפיצה של הקליעים.

---

## 6. Slice 4 — רקע וכוכבים

ב-`Renderer.ts`:

1. `ctx.fillStyle = colors.background; ctx.fillRect(0, 0, bounds.width, bounds.height)`
   (לא `clearRect` — הרקע אטום ממילא, וזה חוסך שלב).
2. ציור מערך הכוכבים: `{ x, y, radius, alpha }`, כל אחד `arc` + `fill` בלבן עם
   `globalAlpha`. אין נצנוץ ואין תנועה (§44 — רקע סטטי).

יצירת הכוכבים — פונקציה `createStars(bounds)` ב-`Renderer.ts` (או קובץ נפרד קטן),
נקראת מתוך `GameEngine.resize()` בלבד. מיקומים ב-`Math.random()` ביחס ל-bounds
הנוכחיים, כך שהפריסה תקינה בכל גודל מסך ובכל Orientation.

> כוכבי לכת ואסטרואידים (`DESIGN.md` — "מראה ותחושה") הם **Polish ויזואלי של M7**
> (Asset Integration). ב-M2 נדרש רק "רקע חלל אפל + כוכבים סטטיים" לפי
> `MILESTONES.md` Slice 4.

**אימות Slice:** רקע כהה אחיד עם כוכבים; אין "שובל" של פריימים קודמים; אחרי Resize
הכוכבים מפוזרים על כל השטח החדש.

---

## 7. Slice 5+6 — Cannon ומיקוד לכיוון הלחיצה

`src/game/Cannon.ts`:

```ts
export class Cannon {
  x = 0;  y = 0;            // מרכז הסיבוב, CSS px
  angle = -Math.PI / 2;     // מתחיל ישר למעלה
  targetAngle = -Math.PI / 2;

  setBounds(bounds: GameBounds): void  // מיקום מחדש אחרי Resize
  aimAt(target: Vector2): void         // atan2 + clamp
  update(deltaSeconds: number): void   // הנעת angle לעבר targetAngle
  getMuzzlePosition(): Vector2         // נקודת יציאת הקליע
}
```

- **מיקום (§10):** `x = bounds.width / 2`, `y = bounds.height - bottomMargin - height / 2`.
  התותח אינו נע לעולם על X או Y; רק `setBounds` משנה אותו.
- **זווית (§10):** `Math.atan2(target.y - y, target.x - x)`. במערכת הקואורדינטות של
  Canvas ציר Y יורד, ולכן "למעלה" הוא `-π/2`; ערכים חוקיים הם `[-π, 0]` (החצי
  העליון). זווית מחוץ לטווח נצמדת לקצה הקרוב — ראו החלטה §1.1.
- **חלקות:** `angle` מתקרב ל-`targetAngle` ב-`update()` לפי `rotationLerp`,
  עם טיפול נכון ב-wrap-around (לקצר את הדרך דרך ±π). אם החלקות מסתבכת או מרגישה
  איטית — להוריד ל-הצמדה מיידית (`angle = targetAngle`); ה-PRD דורש רק שהתותח
  "מסתובב לכיוון הנקודה", לא אנימציה.
- **Muzzle:** `{ x: x + cos(angle) * muzzleOffset, y: y + sin(angle) * muzzleOffset }`.
  הקליע נוצר שם ולא במרכז התותח, כדי שלא ייראה יוצא מתוך הגוף.

**ציור (`Renderer.drawCannon`)** — `ctx.save()` → `translate(x, y)` →
`rotate(angle + Math.PI / 2)` (הספרייט מצויר "עומד" כלפי מעלה, ולכן ההיסט) →
ציור גוף + קנה + Glow (`shadowBlur`/`shadowColor`) → `ctx.restore()`.
**חובה** `save`/`restore` מסביב לכל שינוי טרנספורם, אחרת ה-DPR transform ייהרס.

### Input Handling (§11)

ב-`useGameEngine`, מאזין `pointerdown` על אלמנט ה-`<canvas>`:

```text
const rect = canvas.getBoundingClientRect()
const x = event.clientX - rect.left        // כבר ב-CSS px — תואם למערכת הציור
const y = event.clientY - rect.top
engine.shoot(x, y)
```

- להשתמש ב-`pointerdown` בלבד (לא `click` — מוסיף השהיה; לא `touchstart`+`click`
  יחד — יוצר ירייה כפולה במובייל).
- `event.preventDefault()` למניעת בחירת טקסט/גלילה.
- אין תמיכה ב-Keyboard/Drag/Swipe/Multi-touch (§11): לטפל ב-`pointerdown` בודד
  ולהתעלם מ-`pointerId` נוספים באותו Frame הוא מיותר ל-MVP — כל נגיעה = ירייה אחת,
  וזה בדיוק ההתנהגות הרצויה.
- **RTL:** `getBoundingClientRect()` מחזיר קואורדינטות מסך אמיתיות, כך ש-`dir="rtl"`
  אינו משפיע. מערכת הקואורדינטות של ה-Canvas נשארת רגילה (§37) — **אין** להפוך את X.

**אימות Slice:** לחיצה בפינה שמאלית עליונה, ימנית עליונה ובמרכז מכוונת את התותח
נכון; לחיצה מתחת לתותח אינה מסובבת אותו כלפי מטה; באמולציית מובייל נגיעה עובדת
זהה ואינה גוללת את הדף.

---

## 8. Slice 7+8 — Projectile: יצירה ותנועה

`src/game/Projectile.ts` — פונקציות טהורות (לא מחלקה; אין state פנימי):

```ts
createProjectile(origin: Vector2, target: Vector2): Projectile
updateProjectile(p: Projectile, deltaSeconds: number): void
isOutOfBounds(p: Projectile, bounds: GameBounds): boolean
```

**חישוב ה-Vector (§12):**

```text
dx = target.x - origin.x
dy = target.y - origin.y
len = Math.hypot(dx, dy)
if (len === 0) → להשתמש בכיוון התותח הנוכחי (מניעת חלוקה באפס בלחיצה על ה-muzzle עצמו)
velocityX = (dx / len) * speed
velocityY = (dy / len) * speed
```

- `id` — מונה עולה פנימי ב-Engine (`proj-1`, `proj-2`...). **לא** `crypto.randomUUID()`
  ולא `Date.now()`: מונה זול יותר ודטרמיניסטי לדיבוג.
- **הקליע אינו עוצר בנקודת היעד** — הוא ממשיך באותו וקטור עד לגבולות
  (§12: אין Homing; PRD §4.5: "הקליע ינוע לכיוון אותה נקודה").
- `updateProjectile`: `x += velocityX * delta; y += velocityY * delta`.
- `isOutOfBounds`: מחוץ ל-`[-margin, width + margin] × [-margin, height + margin]`
  כאשר `margin = projectile.radius + trailLength` — כדי שהשובל לא ייחתך בפתאומיות.

**ב-`GameEngine.shoot(x, y)`:**

1. אם `projectiles.length >= maxActive` → להתעלם מהירייה (§1.2).
2. `cannon.aimAt({ x, y })`.
3. `createProjectile(cannon.getMuzzlePosition(), { x, y })` ודחיפה למערך.
   שים לב: ה-muzzle מחושב **אחרי** `aimAt` כדי שהקליע ייצא מהקנה בכיוון הנכון.

**Cleanup במערך (§54):** בכל Frame, לאחר העדכון — סינון במקום
(`for` יורד + `splice`, או `projectiles = projectiles.filter(p => p.active)`).
עבור ≤40 פריטים `filter` קריא ומספיק יעיל; זו הבחירה.

**ציור (`Renderer.drawProjectiles`)** — לכל קליע: קו/`linearGradient` מ-
`(x - vx̂ * trailLength, y - vŷ * trailLength)` אל `(x, y)` בגוון ורוד/סגול
(`DESIGN.md` — "קליע לייזר זוהר, בעיקר בגווני סגול/ורוד"), פלוס עיגול זוהר בראש
עם `shadowBlur`. להגדיר `shadowBlur = 0` בסוף כדי שלא ידלוף לציורים הבאים.

**אימות Slice:** כל לחיצה = קליע אחד בדיוק; הקליע יוצא מקצה הקנה; נע בקו ישר לעבר
נקודת הלחיצה וממשיך מעבר לה; נעלם בגבולות; לחיצות רצופות מהירות יוצרות מספר
קליעים במקביל ללא האטה.

---

## 9. `GameEngine.ts` — ה-API

לפי `ARCHITECTURE §52`, עם **רק** הפעולות שיש להן משמעות ב-M2
(`restartLevel()` נוסף ב-M4 יחד עם החיים והשלבים):

```ts
export class GameEngine {
  constructor(canvas: HTMLCanvasElement);
  start(): void;                       // מפעיל את ה-GameLoop
  stop(): void;                        // עוצר את ה-Loop, שומר את המצב
  destroy(): void;                     // stop() + ניקוי references
  resize(cssWidth: number, cssHeight: number): void;
  shoot(x: number, y: number): void;   // קואורדינטות CSS px יחסית ל-Canvas
}
```

- ה-Engine מחזיק: `ctx`, `bounds`, `cannon`, `projectiles`, `stars`, `renderer`, `loop`.
- **אין ב-Engine שום import מ-React ושום גישה ל-`document`** מעבר ל-canvas שהוזרק.
- ה-Engine **אינו** רושם Event Listeners בעצמו — ה-Hook עושה זאת וקורא ל-`shoot()`.
  כך אחריות הניקוי נשארת במקום אחד.
- `resize()` עם רוחב או גובה 0 (container מוסתר) — יציאה מוקדמת בלי לגעת ב-canvas.

## 10. `useGameEngine.ts` — הגשר ל-React

```ts
export function useGameEngine(): {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}
```

`useEffect` יחיד עם מערך תלויות ריק:

1. יצירת `new GameEngine(canvas)`.
2. `ResizeObserver` על ה-container → `engine.resize(width, height)`
   (מ-`contentRect`), כולל קריאה ראשונית מיידית.
3. `canvas.addEventListener('pointerdown', handler)`.
4. `engine.start()`.
5. **פונקציית ניקוי (§53, קריטי):**
   - `resizeObserver.disconnect()`
   - `canvas.removeEventListener('pointerdown', handler)`
   - `engine.destroy()`

**React StrictMode:** `main.tsx` עוטף ב-`<StrictMode>`, ולכן ב-dev ה-Effect רץ
פעמיים (mount → cleanup → mount). חובה שה-cleanup יהיה מלא ואידמפוטנטי, אחרת
יישארו **שני** לולאות rAF והקליעים ינועו במהירות כפולה. זו נקודת בדיקה מפורשת.

---

## 11. שינוי `GamePage.tsx`

```tsx
<div className="game-page">
  <div className="game-page__hud" aria-hidden="true"> ... נשאר placeholder ... </div>
  <GameCanvas />
  <Button variant="danger" onClick={() => navigate(ROUTES.home)}>סיים משחק</Button>
</div>
```

- להסיר את `.game-page__canvas-placeholder` מה-TSX ומה-CSS.
- לוודא ש-`.game-page` מקבל גובה אמיתי כך ש-`flex: 1` על ה-Canvas עובד
  (`#root` כבר `display: flex; flex-direction: column; min-height: 100dvh`).
- **לא** לגעת ב-HUD ובכפתור — הם M3/M4/M5.
- להשאיר בהערת ה-JSDoc של הקומפוננטה עדכון: מה קיים עכשיו ומה עדיין מגיע.

---

## 12. Slice 9 — Cleanup (Definition of Done של ההפרדה)

רשימת בדיקה מפורשת (§53, §61):

- [ ] יציאה מ-`/game` (לחיצה על "סיים משחק" או ניווט) עוצרת את ה-rAF —
      נקודת עצירה ב-`onFrame` לא נפגעת לאחר היציאה.
- [ ] `pointerdown` מוסר — לחיצה על המסך לאחר יציאה אינה זורקת ואינה יורה.
- [ ] `ResizeObserver` מנותק.
- [ ] כניסה ויציאה חוזרת מ-`/game` חמש פעמים אינה מצטברת (אין האצה, אין דליפה).
- [ ] אין `console.error` / `console.warn` בשימוש רגיל.

---

## 13. תוכנית בדיקה ידנית ל-Milestone 2

| # | תרחיש | תוצאה מצופה |
|---|--------|--------------|
| 1 | פתיחת `/game` | Canvas עם רקע חלל + כוכבים + תותח בתחתית במרכז |
| 2 | לחיצה במרכז עליון | התותח מצביע למעלה; קליע אחד עולה ישר |
| 3 | לחיצה בפינה שמאלית עליונה | התותח מסתובב שמאלה; הקליע נע באלכסון לכיוון הנקודה |
| 4 | לחיצה מתחת לגובה התותח | הזווית נצמדת לאופק; אין ירי כלפי מטה |
| 5 | לחיצה על נקודה קרובה מאוד לתותח | הקליע ממשיך מעבר לנקודה עד הגבול; אין קריסה/NaN |
| 6 | 10 לחיצות מהירות | 10 קליעים; אין האטה; כולם נעלמים בגבול |
| 7 | שינוי גודל חלון בזמן משחק | Canvas מתעדכן; התותח נשאר בתחתית במרכז; אין עיוות |
| 8 | DevTools → אמולציית מובייל + Touch | נגיעה יורה; הדף **אינו** נגלל; אין Zoom |
| 9 | סיבוב Portrait↔Landscape באמולציה | הפריסה מתעדכנת; אין קריסה |
| 10 | יציאה וכניסה חוזרת ל-`/game` | ההתנהגות זהה; אין האצת קליעים (בדיקת StrictMode) |
| 11 | `npm run build` | עובר; אפס שגיאות TypeScript |
| 12 | `npm run lint` | עובר נקי |

---

## 14. Definition of Done ל-Milestone 2

מתוך `MILESTONES.md` + דרישות הקוד מ-`ARCHITECTURE §61`:

- [ ] מסך המשחק מציג Canvas תקין, חד גם ב-`devicePixelRatio > 1`.
- [ ] התותח מופיע בתחתית המסך במיקום קבוע.
- [ ] לחיצה או נגיעה מסובבת את התותח לכיוון הנקודה.
- [ ] כל לחיצה יוצרת קליע אחד בלבד.
- [ ] הקליע נע לכיוון נקודת הלחיצה ונעלם בגבולות אזור המשחק.
- [ ] התנועה מבוססת Delta Time (`requestAnimationFrame`, ללא `setInterval`).
- [ ] הרקע: חלל אפל + כוכבים סטטיים.
- [ ] מנוע המשחק (`src/game/`) אינו מייבא React.
- [ ] Cleanup מלא ביציאה מהמסך; אין Game Loop שנשאר פעיל.
- [ ] `npm run build` ו-`npm run lint` עוברים ללא שגיאות; אין `any`.
- [ ] אין Console Errors בשימוש רגיל.
- [ ] כל Slices 1–9 של Milestone 2 מסומנים ✅ ב-`spec/MILESTONES.md`.

---

## 15. הכנה ל-Milestone 3 (לא לממש עכשיו)

הפרדות שכדאי לשמור ב-M2 כדי ש-M3 (אויבים, Collision, ניקוד) יתחבר בלי שכתוב —
**בלי** לכתוב קוד עבורן עכשיו:

- `GameEngine.update()` יהיה רצף קריאות מסודר, כך שהוספת `spawner.update()`,
  `moveEnemies()` ו-`detectCollisions()` תהיה הוספת שורות בלבד.
- `Renderer` מקבל את מה שצריך לצייר כפרמטרים ואינו קורא ישירות ל-state של ה-Engine,
  כך שהוספת `drawEnemies()` לא תדרוש שינוי חתימות קיימות.
- `gameConfig.ts` כבר קיים כמקור יחיד — M3 יוסיף בו `enemyTypes` ו-`levels`.

---

## 16. עצירות ונקודות אישור (לפי `CLAUDE.md`)

- **לא לבצע `git commit` ולא deploy** בלי אישור מפורש מהמפתח.
- אין צורך בחשבונות/מפתחות ל-M2 — אם בכל זאת יתעורר צורך, **לעצור ולשאול**.
- בסיום Milestone 2 — **לעצור ולהמתין לבדיקת המפתח** לפני מעבר ל-Milestone 3.
- כל סתירה אמיתית בין מסמכים שאינה נפתרת בכלל התחום → **לשאול לפני החלטה**.
