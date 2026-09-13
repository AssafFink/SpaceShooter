# Milestone 6 – Persistence & Statistics — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 6** מתוך `spec/MILESTONES.md`.
> מטרה: לשמור תוצאות משחק (Win/Loss) והעדפת Sound מקומית ב-`localStorage`, דרך
> Service מרוכז אחד; להציג את היסטוריית המשחקים במסך הסטטיסטיקות (ממוין מהחדש
> לישן, עם מצב "אין נתונים"); ולוודא שמשחק שננטש (סיום יזום / Refresh / סגירה)
> **אינו** נשמר. בסוף M6 — Win ו-Loss נשמרים ומוצגים נכון, העדפת Sound שורדת
> Refresh, ונתונים פגומים אינם גורמים ל-Crash.
>
> **לא** נכללים ב-Milestone זה:
> - Audio אמיתי (מוזיקה, אפקטים, חיבור ה-Sound Toggle לאודיו בפועל) — **M7**.
>   ב-M6 מוסיפים רק את **persistence** של העדפת ה-Mute; האייקון עדיין לא מפיק קול.
> - שילוב Assets גרפיים סופיים, Polish של מעברים — **M7**.
> - Responsive מלא למובייל, Orientation, PWA ו-Offline — **M8**.
>
> **גבול קריטי:** M6 הוא כולו שכבת נתונים + הצגה. אין לגעת במנוע המשחק
> (`src/game/**`), ב-Rendering, בחוקי המשחק או ב-Audio. כל העבודה היא
> Service + React (StatisticsPage, GamePage, SoundContext).

---

## 0. הקשר ונקודת מוצא

מה שקיים היום (Milestones 1–5 הושלמו):

- `src/pages/StatisticsPage.tsx` — שלד בנוי סביב דגל קבוע `hasResults = false`.
  יש מבנה טבלה מלא (`תאריך / ניקוד / שלב / תוצאה`) ומצב "אין נתונים"
  (`עדיין אין משחקים קודמים להצגה`). ההערה בקוד מציינת שהקריאה מ-localStorage היא M6.
- `src/pages/StatisticsPage.css` — עיצוב הטבלה, ה-`th` הצהובים, מצב ריק — קיים.
- `src/pages/GamePage.tsx` — `useEffect` שמזהה `status === 'won' | 'lost'` ובונה
  `GameOverState` (result/finalScore/levelReached) ומנווט ל-`/game-over` עם
  `location.state`. ההערה בקוד מציינת "שמירת התוצאה בסטטיסטיקות — Milestone 6".
  **זו נקודת השמירה של M6** (החלטה מ-`milestone-5.md §14`).
- `src/pages/GameOverPage.tsx` — קורא `location.state`; אם אין state (Refresh /
  כניסה ישירה) → `Navigate to="/"`. אין ואסור בו שמירה (ראו החלטה 2).
- `src/context/SoundContext.tsx` — `SoundProvider` עם `useState(false)` בזיכרון
  בלבד. ההערה בקוד כבר מתעדת מפורשות: **"Milestone 6 יאתחל את הערך ההתחלתי
  מ-`storageService.getSoundMuted()` ו-`toggle()` יקרא גם ל-`setSoundMuted()`"**.
- `src/context/soundContextValue.ts` — `SoundContextValue = { muted, toggle }`.
  **לא צריך להשתנות** — ה-API אל הרכיבים הצורכים (`SoundToggle`, `GameHud`,
  `Navigation`) נשאר זהה, ולכן הם לא ישתנו.
- `src/types/navigation.ts` — `GameOverState { result: 'win'|'loss'; finalScore;
  levelReached }`. נשען עליו בבניית ה-`GameResult`.
- `src/types/game.ts` — `GameStats`, `GameStatus`, וכו'. **לא נוגעים בו** (זה טיפוסי
  מנוע; טיפוסי ה-Persistence הולכים ל-`types/statistics.ts` לפי ARCHITECTURE §3).
- **אין** תיקיית `src/services/` — צריך ליצור אותה (`storageService.ts`).
- כל `src/game/**` — מנוע עצמאי שאינו מייבא React; **לא נוגעים בו ב-M6**.

`ARCHITECTURE` הרלוונטי ל-M6: §25 (Game Result Model), §26 (מפתחות localStorage),
§27 (Statistics Storage), §28 (מתי שומרים), §29 (Statistics Screen), §32–33
(Sound Settings + Persistence), §48 (Error Handling), §49 (localStorage Service).
`PRD` הרלוונטי: §4.15 (מסך סטטיסטיקות), §4.18 (Sound Persistence), Flows 5/6
(שמירה ב-Win/Loss), §4.14 + מקרי הקצה (אי-שמירה בניתוק).

אין צורך בשום חשבון, סיסמה או מפתח API עבור Milestone 6 — הכל מקומי, Frontend בלבד.

---

## 1. החלטות טכניות ל-Milestone זה

| נושא | החלטה | נימוק / מקור |
|------|--------|--------------|
| Service מרוכז | קובץ יחיד `src/services/storageService.ts` עם 4 פונקציות: `getStatistics()`, `saveGameResult()`, `getSoundMuted()`, `setSoundMuted()`. **אף רכיב לא קורא ל-`localStorage` ישירות** | ARCHITECTURE §49 |
| מפתחות | `spaceShooter.statistics`, `spaceShooter.soundMuted` (קבועים בתוך ה-Service) | ARCHITECTURE §26 |
| מודל התוצאה | `src/types/statistics.ts`: `GameResultType = 'win'\|'loss'`, `GameResult { id, date, finalScore, levelReached, result }` | ARCHITECTURE §25 |
| `id` | `crypto.randomUUID()` בזמן השמירה | Chrome/Edge מודרניים תומכים (§56); פשוט וייחודי |
| `date` | `new Date().toISOString()` (ISO 8601) בזמן השמירה; הצגה בפורמט ידידותי בעברית | ARCHITECTURE §25 |
| היכן שומרים | ב-`GamePage`, בתוך ה-`useEffect` הקיים של won/lost, **לפני** `navigate(/game-over)` | milestone-5.md §14; ה-React side מחזיק את הנתונים ואת הניווט (ARCHITECTURE §51) |
| מניעת שמירה כפולה | `savedRef` (useRef) ב-`GamePage` — שומר פעם אחת בלבד לכל mount/משחק | StrictMode מפעיל effects פעמיים ב-dev; הגנה דפנסיבית |
| אי-שמירה בניתוק | סיום יזום (Flow 7) כבר מנווט ל-`/` בלי לגעת ב-Service; Refresh/סגירה — אין קוד שמירה בנקודות האלה | ARCHITECTURE §28; PRD §4.14 + מקרי קצה |
| מיון בהצגה | ה-Service מחזיר כפי שנשמר (append בסוף); ה-**מסך** מציג מהחדש לישן (reverse/סדר יורד) | ARCHITECTURE §27 ("החדש ביותר ראשון") |
| Sound persistence | `SoundProvider` מאתחל `useState(() => getSoundMuted())`; `toggle` מחשב `next` וקורא `setSoundMuted(next)` | ARCHITECTURE §32–33; PRD §4.18 |
| Error Handling | כל קריאה/כתיבה עטופה ב-try/catch; JSON פגום → ברירת מחדל בטוחה (`[]` / `false`); localStorage לא זמין → לא קורס | ARCHITECTURE §48 |
| מנוע המשחק | **לא משתנה** ב-M6 | ARCHITECTURE §51 |

### החלטות שאינן מוגדרות במפורש באף מסמך

לפי `ARCHITECTURE §66.3` ("הפתרון הפשוט ביותר שמתאים ל-MVP"). מתועדות כאן ומסומנות
לתשומת לב בבדיקה; אינן דורשות עצירה מוקדמת:

1. **מיקום השמירה (GamePage ולא GameOverPage).** השמירה נעשית ב-`GamePage` ברגע
   המעבר ל-won/lost, לפני הניווט. נימוק: (א) `milestone-5.md §14` תכנן זאת כך;
   (ב) `GameOverPage` נשען על `location.state` שנעלם ב-Refresh — שמירה שם הייתה
   דורשת התמודדות עם re-mount/refresh. שמירה ב-GamePage מבטיחה שמירה **פעם אחת**
   בדיוק ברגע סיום המשחק. **סומן לתשומת לב בבדיקה.**

2. **`GameOverPage` לא שומר ולא מוחק כלום.** הוא מסך תצוגה בלבד. Refresh בו →
   redirect ל-`/` (קיים) → **אין** שמירה חוזרת. זה מכבד את "אין לשמור ב-Refresh"
   (§28) אוטומטית.

3. **וֶלידציה של רשומות.** `getStatistics()` מוודא שהערך המפוענח הוא Array; רשומות
   שאינן אובייקט תקין מסוננות בזהירות (best-effort) כדי שלא יפילו את הרינדור.
   אין צורך ב-schema validation מלא ל-MVP — רק הגנה מפני Crash (§48).

4. **פורמט תאריך בתצוגה.** `new Date(iso).toLocaleString('he-IL', {...})` (תאריך +
   שעה קצרים). אם ה-`date` פגום/לא ניתן ל-parse — מציגים את המחרוזת הגולמית או "—"
   במקום לקרוס.

5. **מחיקת נתונים.** אין UI למחיקה/עריכה/ניקוי (PRD §4.15, ARCHITECTURE §29).
   לא מוסיפים כזה. (לניקוי ידני בזמן פיתוח — DevTools/localStorage; לא חלק מהמוצר.)

> אם במהלך הבנייה תתעורר סתירה אמיתית שכלל התחומים אינו פותר — **לעצור ולשאול**
> לפי `CLAUDE.md`.

---

## 2. מפת הקבצים (יצירה / שינוי)

**ליצור:**

```text
src/types/statistics.ts            ← GameResultType, GameResult (ARCHITECTURE §25)
src/services/storageService.ts     ← 4 פונקציות + מפתחות + Error Handling (§26, §48, §49)
```

**לשנות:**

```text
src/context/SoundContext.tsx       ← אתחול muted מ-getSoundMuted(); toggle קורא setSoundMuted()
src/pages/GamePage.tsx             ← saveGameResult() לפני הניווט ל-/game-over (+ savedRef)
src/pages/StatisticsPage.tsx       ← קריאה מ-getStatistics(), מיון, מילוי שורות, מצב ריק
src/pages/StatisticsPage.css       ← (רק אם נדרש) עמודות/מרווחים לשורות אמיתיות
spec/MILESTONES.md                 ← סימון Slices 1–10 של M6 כ-✅ תוך כדי העבודה
```

**לא לגעת ב-M6:** כל `src/game/**`, `src/types/game.ts`, `Renderer`, המנוע,
ה-Audio (M7), `soundContextValue.ts`, `useSound.ts`, `SoundToggle.tsx`,
`GameHud.tsx`, `Navigation.tsx`, `GameOverPage.tsx` (החלטה 2), ו-`main.tsx`.

---

## 3. Slice 2 — מודל התוצאה (`src/types/statistics.ts`)

```ts
export type GameResultType = 'win' | 'loss';

export interface GameResult {
  id: string;          // crypto.randomUUID() — נוצר בשמירה
  date: string;        // ISO 8601 — new Date().toISOString()
  finalScore: number;
  levelReached: number;
  result: GameResultType;
}
```

- טיפוס נפרד מ-`game.ts` (טיפוסי מנוע) לפי מבנה הפרויקט (ARCHITECTURE §3).
- שדות זהים ל-`GameOverState` פרט ל-`id`+`date` (שנוצרים בשמירה) ו-`result`
  שהוא כבר `'win'|'loss'` בשני המקומות — נוח לבנייה מתוך ה-state הקיים.

---

## 4. Slice 1 + 9 — Storage Service (`src/services/storageService.ts`)

הלב של ה-Milestone. **כל** גישה ל-localStorage עוברת דרך כאן, כל פעולה עטופה
ב-try/catch, וכל כישלון חוזר לברירת מחדל בטוחה (§48).

### 4.1 מפתחות

```ts
const STATISTICS_KEY = 'spaceShooter.statistics';
const SOUND_MUTED_KEY = 'spaceShooter.soundMuted';
```

### 4.2 `getStatistics(): GameResult[]`

- קורא את המפתח; אם `null` → מחזיר `[]`.
- `JSON.parse` בתוך try/catch; אם נכשל → `[]` (§48).
- מוודא ש-`Array.isArray(parsed)`; אם לא → `[]`.
- מסנן best-effort רשומות שאינן אובייקט תקין (החלטה 3) — לא זורק.
- מחזיר את המערך **בסדר השמירה** (המיון לתצוגה נעשה במסך — §6).

### 4.3 `saveGameResult(input): void`

- חתימה מומלצת: מקבל את השדות העסקיים בלבד ובונה את הרשומה המלאה:

```ts
function saveGameResult(input: {
  result: GameResultType;
  finalScore: number;
  levelReached: number;
}): void
```

- בונה `GameResult` עם `id = crypto.randomUUID()` ו-`date = new Date().toISOString()`.
- קורא `getStatistics()`, מוסיף בסוף (`[...existing, newResult]`), וכותב חזרה עם
  `JSON.stringify` — הכל ב-try/catch (כתיבה עלולה להיכשל, למשל מכסה מלאה/מצב פרטי);
  כישלון → no-op שקט (לא קורס את המשחק).
- אין הגבלה מלאכותית על מספר הרשומות (ARCHITECTURE §27).

### 4.4 `getSoundMuted(): boolean`

- קורא את המפתח; אם `null` או שגיאה → `false` (§48, ברירת מחדל לא מושתק).
- מפענח ל-boolean (למשל השוואה ל-`'true'` או `JSON.parse` עטוף); ערך לא צפוי → `false`.

### 4.5 `setSoundMuted(muted: boolean): void`

- כותב את הערך (למשל `String(muted)` או `JSON.stringify(muted)`) ב-try/catch;
  כישלון → no-op שקט.

> הערה: כל התיעוד וההערות בקוד **באנגלית בלבד** (CLAUDE.md — קונבנציות קוד).

---

## 5. Slices 3 + 4 + 5 — שמירת Win/Loss ואי-שמירת משחק שננטש (`GamePage`)

מטרה (PRD Flows 5/6, ARCHITECTURE §28): לשמור **רק** ב-Win ו-Loss; **לא** לשמור
בסיום יזום / Refresh / סגירה.

שינוי ב-`useEffect` הקיים (won/lost) ב-`GamePage.tsx`:

```tsx
const savedRef = useRef(false);

useEffect(() => {
  if (stats.status !== 'won' && stats.status !== 'lost') return;
  if (savedRef.current) return;          // save exactly once per game
  savedRef.current = true;

  const result: GameResultType = stats.status === 'won' ? 'win' : 'loss';
  saveGameResult({
    result,
    finalScore: stats.score,
    levelReached: stats.currentLevel,
  });

  const state: GameOverState = { result, finalScore: stats.score, levelReached: stats.currentLevel };
  navigate(ROUTES.gameOver, { replace: true, state });
}, [stats.status, stats.score, stats.currentLevel, navigate]);
```

- **Slice 3 (Win):** נשמר בעת `status === 'won'` (אחרי שלב 10).
- **Slice 4 (Loss):** נשמר בעת `status === 'lost'` (אחרי איבוד החיים השלישי).
- **Slice 5 (אי-שמירה):**
  - **סיום יזום (Flow 7):** `confirmEndGame()` מנווט ל-`/` ואינו נוגע ב-Service —
    נשאר כפי שהוא. אין שמירה.
  - **Refresh / סגירת Tab/PWA:** אין קוד שמירה ב-`beforeunload` או במקום אחר —
    אין שמירה. (אין לשמור Game State פעיל — ARCHITECTURE §9, §28.)
- `savedRef` מונע שמירה כפולה מ-StrictMode/re-render. הוא מתאפס באופן טבעי ב-mount
  חדש של `GamePage` (משחק חדש), כי הרכיב נטען מחדש.
- `GameOverPage` לא משתנה (החלטה 2).

---

## 6. Slices 6 + 7 + 8 — מסך Statistics (`StatisticsPage`)

מטרה (PRD §4.15, ARCHITECTURE §29): טבלה של משחקים קודמים, מהחדש לישן, או מצב ריק.

- **Slice 6 (קריאה):** להחליף את `hasResults = false` הקבוע בקריאה אמיתית:

```tsx
const results = getStatistics();
const hasResults = results.length > 0;
```

  - הקריאה בגוף הרכיב מספיקה (אין צורך ב-`useEffect`/state — הנתונים סטטיים לכל
    כניסה למסך; המסך הוא לצפייה בלבד). אפשר `useMemo` אם רוצים, לא חובה.
- **Slice 7 (מיון):** המשחק האחרון ראשון. מכיוון שה-Service מוסיף בסוף, מציגים
  בסדר הפוך: `const rows = [...results].reverse();` (או מיון יורד לפי `date`).
  להעדיף `reverse()` על עותק — פשוט ועמיד גם אם התאריכים זהים.
- **מילוי שורות** ב-`<tbody>`:
  - `key={result.id}`.
  - **תאריך:** פורמט ידידותי `he-IL` (החלטה 4), עם fallback אם ה-parse נכשל.
  - **ניקוד:** `finalScore`.
  - **שלב:** `levelReached`.
  - **תוצאה:** `result === 'win' ? 'ניצחון' : 'הפסד'` — רצוי עם צבע/תג
    (`--color-success` / `--color-danger`) לעקביות ויזואלית, בלי לחרוג מהעיצוב הקיים.
- **Slice 8 (מצב ריק):** נשאר כפי שהוא — `עדיין אין משחקים קודמים להצגה` כאשר
  `!hasResults`. הטקסט והעיצוב כבר קיימים.
- מבנה הטבלה וה-CSS כבר קיימים; שינוי CSS רק אם השורות האמיתיות דורשות התאמה
  (למשל תג צבע לתוצאה). RTL כבר פעיל גלובלית.

---

## 7. Slice 10 — שמירת העדפת Sound (`SoundContext`)

מטרה (PRD §4.18, ARCHITECTURE §32–33): מצב ה-Mute נשמר ונטען בכניסה הבאה.

שינוי ב-`SoundProvider` בלבד (ה-`SoundContextValue` וכל הצרכנים לא משתנים):

```tsx
const [muted, setMuted] = useState<boolean>(() => getSoundMuted());  // lazy init from storage

const value = useMemo<SoundContextValue>(
  () => ({
    muted,
    toggle: () =>
      setMuted((prev) => {
        const next = !prev;
        setSoundMuted(next);   // persist
        return next;
      }),
  }),
  [muted],
);
```

- אתחול עצל (`() => getSoundMuted()`) — נקרא פעם אחת, מחזיר `false` אם אין/פגום (§48).
- `toggle` מחשב את הערך הבא, שומר אותו, ומחזיר אותו ל-state — מקור אמת יחיד.
- קריאת ה-persist בתוך ה-updater בטוחה (side-effect קטן), אך אפשר גם לחשב את
  `next` מחוץ ל-updater ולקרוא `setMuted(next); setSoundMuted(next);` — שקול, מותר.
- **בלי אודיו אמיתי** — עדיין M7. כאן רק ה-persistence של ההעדפה.
- לעדכן/לצמצם את הערת ה-M6 בקובץ בהתאם למה שמומש (חלק ה-M7 של ההערה נשאר).

---

## 8. תוכנית בדיקה ידנית ל-Milestone 6

| # | תרחיש | תוצאה מצופה |
|---|--------|--------------|
| 1 | סיום משחק ב-**ניצחון** (שלב 10) | רשומת win נוספת ל-`spaceShooter.statistics`; מסך Game Over כרגיל |
| 2 | סיום משחק ב-**הפסד** (3 חיים) | רשומת loss נוספת עם ניקוד/שלב נכונים |
| 3 | מסך סטטיסטיקות אחרי כמה משחקים | טבלה עם השורות; **המשחק האחרון ראשון** |
| 4 | עמודות הטבלה | תאריך ידידותי, ניקוד, שלב, תוצאה (ניצחון/הפסד) — נכונים |
| 5 | **סיום יזום** ("סיים משחק" → אישור) | חזרה ל-`/`; **אין** רשומה חדשה בסטטיסטיקות |
| 6 | **Refresh** באמצע משחק | אין רשומה חדשה; כניסה חוזרת מתחילה משחק חדש |
| 7 | **סגירת Tab** באמצע משחק ופתיחה מחדש | אין רשומה חדשה; אין Resume |
| 8 | Statistics כשאין נתונים (localStorage ריק) | "עדיין אין משחקים קודמים להצגה" |
| 9 | **Persistence אחרי Refresh** | הסטטיסטיקות עדיין מוצגות אחרי סגירת/פתיחת הדפדפן |
| 10 | Sound Toggle → Refresh | מצב ה-Mute נשמר ונטען (האייקון חוזר למצב שנבחר) |
| 11 | Sound מושתק → כניסה מחדש | `muted` מאותחל ל-true מ-localStorage |
| 12 | **JSON פגום** ב-`spaceShooter.statistics` (הזרקה ידנית ב-DevTools) | אין Crash; המסך מציג מצב ריק |
| 13 | **ערך פגום** ב-`spaceShooter.soundMuted` | אין Crash; ברירת מחדל `false` |
| 14 | אין שמירה כפולה (StrictMode dev) | משחק אחד = רשומה **אחת** בלבד |
| 15 | אף רכיב לא קורא ל-localStorage ישירות | רק `storageService.ts` ניגש ל-localStorage |
| 16 | `npm run build` | עובר; אפס שגיאות TypeScript; אין `any` |
| 17 | `npm run lint` | עובר נקי |
| 18 | Console לאורך כל ה-Flows | אין שגיאות |

---

## 9. Definition of Done ל-Milestone 6

מתוך `MILESTONES.md` (DoD של M6) + דרישות הקוד (`ARCHITECTURE §61`):

- [ ] `storageService.ts` מרוכז עם `getStatistics / saveGameResult / getSoundMuted / setSoundMuted`.
- [ ] `GameResult` מוגדר ב-`types/statistics.ts` (id, date, finalScore, levelReached, result).
- [ ] Win נשמר נכון (אחרי שלב 10); Loss נשמר נכון (אחרי 3 חיים).
- [ ] משחק שננטש (סיום יזום / Refresh / סגירה) **אינו** נשמר.
- [ ] מסך Statistics קורא מ-localStorage, מציג טבלה, מהחדש לישן.
- [ ] מצב "עדיין אין משחקים קודמים להצגה" עובד.
- [ ] העדפת Sound (Mute) נשמרת ונטענת בכניסה הבאה.
- [ ] נתונים פגומים / localStorage לא זמין אינם גורמים ל-Crash (ברירות מחדל בטוחות).
- [ ] אף רכיב אינו ניגש ל-localStorage ישירות — רק דרך ה-Service.
- [ ] מנוע המשחק (`src/game/**`) לא שונה; `src/game/` עדיין אינו מייבא React.
- [ ] אין Audio אמיתי, אין Assets גרפיים, אין עבודת Responsive/PWA ב-M6.
- [ ] `npm run build` ו-`npm run lint` עוברים ללא שגיאות; אין `any`.
- [ ] אין Console Errors בשימוש רגיל.
- [ ] כל Slices 1–10 של Milestone 6 מסומנים ✅ ב-`spec/MILESTONES.md`.

---

## 10. הכנה ל-Milestone 7 (לא לממש עכשיו)

- ה-`SoundContext` יהיה מקור האמת ל-`muted`; M7 יוסיף Audio Service שמאזין ל-`muted`
  ומשתיק/מפעיל בפועל — בלי לשנות את `SoundProvider` או את הצרכנים.
- `storageService` מרוכז וזמין להרחבה אם M7/M8 ידרשו מפתחות נוספים (לא צפוי — §26).
- `GameResult`/`getStatistics` יציבים; אין צורך לשנותם ב-Milestones הבאים.

---

## 11. עצירות ונקודות אישור (לפי `CLAUDE.md`)

- **לא לבצע `git commit` ולא deploy** בלי אישור מפורש מהמפתח.
- אין צורך בחשבונות/מפתחות ל-M6 — אם בכל זאת יתעורר צורך, **לעצור ולשאול**.
- בסיום Milestone 6 — **לעצור ולהמתין לבדיקת המפתח** לפני מעבר ל-Milestone 7.
- החלטה שסומנה לתשומת לב בבדיקה (§1): שמירת התוצאה נעשית ב-`GamePage` (ולא
  ב-`GameOverPage`). אם המפתח מעדיף אחרת — קל לשנות.
- כל סתירה אמיתית בין מסמכים שאינה נפתרת בכלל התחום → **לשאול לפני החלטה**.
