# Milestone 9 – QA & MVP Release — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 9** מתוך `spec/MILESTONES.md`.
> מטרה: לבדוק את כל המערכת מקצה לקצה, לתקן את הבאגים שנמצאו, לכוונן את רמת
> הקושי לילדים 6–12, ולהגיע ל-Production Build נקי של MVP.
>
> **לא** נכללים ב-Milestone זה:
> - פיצ'רים חדשים שאינם ב-PRD (Pause, Leaderboard, Install button וכו' — PRD §7).
> - שינוי חוקי משחק (HP, ניקוד, 3 חיים, 10 שלבים, Hit Lock) — נעולים מ-M3/M4.
>   כיוונון **ערכי** Speed/Spawn/Count (Slice 13) מותר ומתוכנן.
> - Deploy ו-Commit — רק באישור המפתח (CLAUDE.md).
>
> **עקרון מנחה:** "בדוק → תעד → תקן רק מה שנמצא". כל תיקון קוד חייב להיות
> מקומי, ממוקד, ומלווה בבדיקה (אוטומטית או בדפדפן) שמוכיחה אותו.

---

## 0. נקודת מוצא (Baseline — נמדד בזמן כתיבת התוכנית)

| בדיקה | מצב |
|-------|-----|
| `tsc -b` | ✅ עובר ללא שגיאות |
| `oxlint` | ✅ עובר ללא אזהרות |
| `console.*` / `TODO` בקוד | ✅ אין |
| בדיקות אוטומטיות | ❌ אין כלל (אין Test Runner; `CLAUDE.md` → "בדיקות: `<command>`") |
| Event Listeners | ✅ 3 בלבד, כולם מנוקים (`useGameEngine`, `useAudio`, `Modal`) |
| `package.json` version | ⚠️ `0.0.0` (מסך About מציג "גרסה 1.0") |

Milestones 1–8 הושלמו. סקירת קוד ממוקדת לקראת M9 חשפה את הממצאים ב-§1.

---

## 1. ממצאים מסקירת הקוד (לתיקון ב-M9)

### F1 — הערות קוד בעברית (הפרת קונבנציה) — Slice 12
`CLAUDE.md`: "כל התיעוד וההערות בקוד — **באנגלית בלבד**". בפועל **46 קבצים**
מכילים הערות בעברית (הכבדים: `gameConfig.ts`, `Renderer.ts`, `GameEngine.ts`,
`types/game.ts`, `Enemy.ts`, `useGameEngine.ts`). `storageService.ts`,
`audioService.ts`, `sprites.ts`, `useAudio.ts`, `vite.config.ts` כבר באנגלית.
- **תיקון:** תרגום כל ה-comments וה-JSDoc לאנגלית (TS/TSX/CSS/MJS), שמירה על
  המשמעות ועל הפניות ה-spec (`§N`). **ללא שינוי לוגיקה.** גם 2 הודעות
  `throw new Error` (`GameEngine.ts:71`, `useSound.ts:9`) — הודעות למפתח,
  יתורגמו. **מחרוזות UI בעברית נשארות כמות שהן.**
- **אימות:** סקריפט סריקה (Node, זמני) — 0 שורות comment עם תווי עברית; `tsc`
  + `oxlint` + בדיקות עוברים; `git diff --stat` מראה שינויי הערות בלבד.

### F2 — `crypto.randomUUID()` נכשל ב-Non-Secure Context → Win/Loss לא נשמר — Slice 5
`storageService.saveGameResult()` משתמש ב-`crypto.randomUUID()`, שקיים **רק**
ב-Secure Context (HTTPS / localhost). בבדיקה מטלפון דרך `http://192.168.x.x`
הקריאה זורקת, ה-`catch` בולע אותה, **והתוצאה פשוט לא נשמרת** — בשקט.
- **תיקון:** פונקציית `createResultId()` — `crypto.randomUUID` אם קיים, אחרת
  `game-${Date.now()}-${random base36}`. (ARCHITECTURE §27 מדגים `"game-123"`.)
- **קבצים:** `src/services/storageService.ts`. **בדיקה:** unit test עם
  `crypto.randomUUID` לא מוגדר.

### F3 — Orientation Change באמצע שלב "מעלים" אויבים או מחטיא אותם — Slice 9
`GameEngine.resize()` עושה רק clamp ל-X של אויבים. ה-Y וכיוון התנועה נשארים
מהפריסה הישנה:
- Portrait (≈390×650) → Landscape (≈844×280): אויב ב-`y=500` נמצא מתחת לגבול
  החדש → `hasPassedBottom` מסיר אותו **בשקט** (אויבים "נעלמים", השלב מסתיים
  מהר מדי), או אויב שנמצא ליד התותח החדש → **איבוד חיים לא הוגן**.
- הכיוון מכוון למיקום התותח **הישן** (X=195 במקום 422) → אויבים מחטיאים.
- **תיקון** (ARCHITECTURE §35 — "מותר Reposition קצר"):
  1. מיקום יחסי: `x *= newW/oldW`, `y *= newH/oldH` (רק כשהיו bounds קודמים).
  2. **Re-aim** של כל אויב לעבר מיקום התותח החדש, תוך שמירת גודל המהירות
     (ללא jitter חדש — פונקציה חדשה `retargetEnemy` ב-`Enemy.ts`).
  3. ניקוי קליעים פעילים (הם מכוונים ליעדים שכבר לא קיימים; "איפוס קצר").
  4. **Grace:** אויב שאחרי ה-Reposition נמצא בתוך אזור הפגיעה של התותח
     מוזז למעלה עד לגבול האזור — Resize לעולם לא גורם לאיבוד חיים.
  - Score/Lives/Level/Status לא נגעים (כמו היום).
- **קבצים:** `src/game/GameEngine.ts`, `src/game/Enemy.ts`.
- **בדיקה:** unit test ל-resize + אימות ב-preview עם `resize_window`.

### F4 — Canvas ריק אחרי Resize כשהמשחק מוקפא (Dialog פתוח) — Slice 9
הצבת `canvas.width` מנקה את ה-Canvas; כש-"סיים משחק" פתוח הלולאה עצורה ואין
Render עד "ביטול" → מסך שחור מאחורי ה-Dialog אחרי סיבוב.
- **תיקון:** קריאה ל-`this.render()` בסוף `resize()`. **קובץ:** `GameEngine.ts`.

### F5 — Multi-touch ולחיצה ימנית יורים — Slice 1
`handlePointerDown` יורה על כל `pointerdown`: אצבע שנייה (ARCHITECTURE §11 —
"אין Multi-touch shooting") וגם כפתור עכבר ימני/אמצעי.
- **תיקון:** להתעלם כש-`!event.isPrimary` או (`pointerType === 'mouse'` ו-
  `event.button !== 0`). **קובץ:** `src/hooks/useGameEngine.ts`.

### F6 — רמת הקושי תלויה בגובה המסך (Landscape קשה פי ~2.6) — Slice 13
מהירות האויבים מוגדרת ב-px/s קבועים, בעוד מרחק המסלול תלוי בגובה ה-Canvas.
ניתוח `LEVELS` הנוכחי (ממוצעי טווחים; מרחק Spawn→תותח ≈ גובה פחות ~70px):

| שלב | אויבים | HP/אויב | סה"כ פגיעות | מרווח Spawn | פגיעות/שנייה | זמן מסלול Portrait (~580px) | זמן מסלול Landscape (~220px) |
|-----|--------|---------|-------------|-------------|--------------|------|------|
| 1 | 5 | 1.35 | 7 | 2.00s | 0.68 | 15.5s | 5.9s |
| 5 | 11 | 1.65 | 18 | 1.50s | 1.10 | 11.4s | 4.3s |
| 8 | 16.5 | 1.90 | 31 | 1.20s | 1.58 | 9.1s | 3.5s |
| 10 | 21 | 2.00 | 42 | 1.00s | 2.00 | 7.8s | **3.0s** |

ב-Landscape בטלפון לילד יש 3 שניות לחסל אויב גדול (3 פגיעות) בשלב 10 — קשה
מדי (PRD §4.9: "גם שלבים מתקדמים אינם צריכים להיות קשים בצורה קיצונית").
- **תיקון:** נרמול מהירות לגובה אזור המשחק — `speed × clamp(height /
  referenceHeight, speedScaleMin, speedScaleMax)` בזמן Spawn (וב-Re-aim של F3).
  ערכים חדשים ב-`GAME_CONFIG.enemy`: `referenceHeight: 640`,
  `speedScaleMin: 0.5`, `speedScaleMax: 1.2`. כך זמן המסלול כמעט אחיד בין
  Portrait, Landscape ו-Desktop גבוה.
- **קבצים:** `gameConfig.ts`, `EnemySpawner.ts`.

### F7 — מוזיקה ממשיכה לנגן כשהאפליקציה ברקע — Slice 6
ב-Mobile/PWA, מעבר לאפליקציה אחרת או נעילת מסך — ה-`AudioContext` ממשיך
לנגן מוזיקה. (המשחק עצמו "קופא" כי rAF נעצר — תקין.)
- **תיקון:** ב-`useAudio` — האזנה ל-`visibilitychange`: `hidden` →
  `audioService.suspend()` (`ctx.suspend()`), `visible` → `audioService.resume()`
  (רק אם הוא כבר unlocked). כולל cleanup. **קבצים:** `useAudio.ts`, `audioService.ts`.

### F8 — גרסה ו-Commands — Slice 15
- `package.json`: `"version": "1.0.0"` (תואם "גרסה 1.0" ב-About, PRD §4.17).
- `CLAUDE.md` → סעיף "פקודות": למלא `npm run dev`, `npm test`, `npm run build`,
  `npm run preview` (CLAUDE.md מציין ש-Claude יכול לייצר אותן).
- `src/services/.gitkeep` — מיותר (התיקייה מכילה קבצים); להסיר.

> ממצאים נוספים שיתגלו במהלך הבדיקות (§3–§5) יתועדו ב-`spec/QA-REPORT.md`
> כ-F9, F10…, יתוקנו אם הם חוסמים/ברורים, ואחרת יוצגו למפתח להחלטה.

---

## 2. בדיקות אוטומטיות — Vitest (Slices 1–5, 12)

### 2.1 החלטה (תחום ARCHITECTURE — §60, §61)
ARCHITECTURE §60 מגדיר רשימת תרחישים שחייבים להיבדק, ו-§61 דורש איכות Build.
חוקי המשחק חיים במודולים טהורים (ללא React) — אידיאליים לבדיקות יחידה, והם
**הדרך היחידה** לבדוק באמינות תרחישים כמו "שני אויבים פוגעים באותו פריים"
(בדפדפן זה כמעט בלתי ניתן לשחזור ידני).
- **תלות חדשה אחת (devDependency): `vitest`** (גרסה 5.x — תומכת Vite 8, נבדק:
  `peerDependencies.vite: ^6.4 || ^7 || ^8`). ללא jsdom — `environment: 'node'`
  עם stubs ממוקדים.
- `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- **מיקום:** תיקיית `tests/` בשורש + `tsconfig.test.json` (מצורף כ-reference
  ב-`tsconfig.json`), כך ש-`tsc -b` בודק גם את קובצי הבדיקה.
- `vitest.config.ts` נפרד (לא מערבב את VitePWA בהרצת בדיקות).

### 2.2 Stubs משותפים — `tests/helpers.ts`
- `vi.mock('../src/game/Renderer')` — Renderer/sprites יוצרים `new Image()` בזמן
  import; המנוע נבדק בלי ציור.
- `createFakeCanvas()` — אובייקט עם `width/height` ו-`getContext()` שמחזיר
  ctx מינימלי (`setTransform` no-op).
- `requestAnimationFrame`/`cancelAnimationFrame` + `window.devicePixelRatio` דרך
  `vi.stubGlobal`; `stepFrames(engine, seconds, dt = 1/60)` מריץ את ה-callback ידנית.
- `internals(engine)` — cast טיפוסי צר לגישה ל-`enemies/projectiles/status`
  בבדיקות בלבד (אין שינוי API בקוד המוצר לצורך בדיקות).
- `mockRandom(sequence)` — `vi.spyOn(Math, 'random')` לדטרמיניזם.
- `localStorage` stub (Map-based) + אפשרות "storage זורק".

### 2.3 קבצי בדיקה ותרחישים (ממופים ל-ARCHITECTURE §60)
| קובץ | תרחישים |
|------|---------|
| `tests/collision.test.ts` | קליע פוגע באויב במסלול (Swept); פוגע ב**ראשון** במסלול ולא ביעד המקורי; קליע פוגע באויב אחד בלבד; ירי לשטח ריק → אין פגיעה; `detectCannonHit` בגבול הרדיוס |
| `tests/enemy.test.ts` | קטן/בינוני/גדול = 1/2/3 פגיעות ו-1/2/3 נקודות; `applyHit` לא מחסל לפני הזמן; `retargetEnemy` שומר גודל מהירות ומכוון לתותח (F3) |
| `tests/spawner.test.ts` | כמות בטווח `enemyCountMin..Max`; Spawn הדרגתי (לא הכל בבת אחת); X בתוך השוליים; מהירות בטווח × scale (F6); `isFinished`/`remainingToSpawn` |
| `tests/gameEngine.test.ts` | משחק חדש: שלב 1, 3 חיים, 0 נקודות; חיסול → Score; השלמת שלב → `level-complete` → אחרי 1.2s שלב הבא, Score/Lives נשמרים; פגיעת תותח → חיים −1, Restart שלב, Score נשמר; **שני אויבים באותו פריים → חיים −1 בלבד**; 3 פגיעות → `lost` + לולאה עצורה; השלמת שלב 10 → `won`; `shoot` מתעלם כשלא `playing`; resize: Score/Lives/Level נשמרים, אויבים בתוך הגבולות ומכוונים לתותח, resize לא מוריד חיים (F3) |
| `tests/storageService.test.ts` | Win נשמר; Loss נשמר; סדר שמירה; JSON פגום / לא-מערך / רשומות לא תקינות → `[]`/סינון; storage זורק → אין crash; `soundMuted` default=false ו-persist; שמירה עובדת בלי `crypto.randomUUID` (F2) |
| `tests/levels.test.ts` | Randomization + כיוונון (§4): 10 שלבים; min≤max בכל טווח; הסתברויות = 1; קושי **לא-יורד** בין שלבים (כמות, מהירות, HP צפוי) ומרווחים **לא-עולים**; תקרת "ידידותי לילדים" (§4.2) |

> **לא** נבדק ביחידה (נבדק בדפדפן, §3): אי-שמירת משחק שננטש (זרימת React
> Router), מעבר מסכים, UI, אודיו.

---

## 3. אימות בדפדפן — Preview Tools (Slices 1–9, 12, 14)

### 3.1 כלי עזר ל-QA: `?level=N` — Dev בלבד
כדי לבדוק את שלב 10 ו-Win בלי לשחק 9 שלבים:
- `GameEngine` constructor מקבל `options?: { startLevel?: number }` (clamp 1..10).
- `useGameEngine` קורא `?level=` **רק** תחת `import.meta.env.DEV` — Vite מסיר את
  הענף ב-Production. **אימות:** grep ב-`dist/` שאין `level=` / `startLevel` פעיל.

### 3.2 תסריט בדיקות (`npm run dev`, Browser pane)
1. **Core (Slice 1):** ירי לאויב, לשטח ריק, HUD מתעדכן (Score, Enemies).
2. **Lives (Slice 2):** לתת לאויב להגיע → פיצוץ, חיים −1, Restart; 3 פעמים → Game Over "הפסד".
3. **Levels (Slice 3):** "שלב X הושלם" מוצג ומתקדם; `?level=10` → השלמה → "ניצחון!".
4. **Statistics (Slice 5):** Win/Loss מופיעים, החדש ראשון; ניקוי `localStorage` →
   "עדיין אין משחקים קודמים להצגה"; "סיים משחק" → אישור → `/`, **לא** נוסף שורה;
   הזרקת JSON פגום → המסך לא קורס.
5. **Audio (Slice 6):** Toggle משנה מצב ו-`spaceShooter.soundMuted`; Reload שומר
   (שמיעה בפועל — למפתח).
6. **Navigation (Slice 7):** Nav מוצג בכל המסכים מלבד `/game`; "סיים משחק" → ביטול
   ממשיך את אותו משחק; אישור → `/`.
7. **Refresh / Close (Slice 8):** Reload ב-`/game` → משחק חדש (שלב 1, 0 נקודות),
   ללא Resume וללא שמירה; Reload ב-`/game-over` → הפניה ל-`/`.
8. **Responsive (Slice 9):** `resize_window` ל-360×640, 390×844, 412×915 (Portrait),
   844×390, 915×412 (Landscape), 768×1024, Desktop — כל 6 המסכים: אין גלישה
   אופקית, כפתורים ≥44px, HUD לא מסתיר את אזור המשחק. **סיבוב באמצע שלב**
   (390×844 ↔ 844×390): Score/Lives/Level נשמרים, אויבים נשארים גלויים (F3),
   גם כש-Dialog פתוח (F4).
9. **Code Quality (Slice 12):** `read_console_messages` — 0 Errors לאורך כל התסריט;
   יציאה מ-`/game` → הלולאה נעצרת (בדיקת `requestAnimationFrame` wrapper מונה
   דרך `javascript_tool`).

> מגבלה ידועה (מ-M7/M8): rAF מושהה כשה-preview מוסתר — בדיקות שתלויות בתנועה
> יבוצעו בחלון גלוי, או יכוסו ע"י §2; מה שלא ניתן לאמת כך מסומן "למפתח".

---

## 4. כיוונון רמת קושי (Slices 4, 13)

### 4.1 גישה
1. תיקון F6 (נרמול לגובה) — מסיר את הגורם הדומיננטי לקושי-יתר.
2. ריכוך קל של שלבים 8–10, שם הדרישה עולה על ~1.6 פגיעות/שנייה:

| שלב | spawnInterval (min–max) היום → מוצע | enemyCount היום → מוצע |
|-----|------|------|
| 8 | 0.9–1.5 → **1.0–1.5** | 14–19 → ללא שינוי |
| 9 | 0.8–1.4 → **0.95–1.45** | 16–21 → **15–20** |
| 10 | 0.7–1.3 → **0.9–1.4** | 18–24 → **17–22** |

   תוצאה צפויה בשלב 10: ~1.74 פגיעות/שנייה (במקום 2.0), עדיין הקשה ביותר, והקושי
   נשאר מונוטוני. שלבים 1–7 ללא שינוי.
3. **מדדי קבלה אוטומטיים** (`tests/levels.test.ts`), מחושבים מהממוצעים:
   - פגיעות נדרשות/שנייה (`E[HP] / avgInterval`) בשלב 10 **≤ 1.8**.
   - זמן מסלול מינימלי (מהירות מקסימלית, `referenceHeight`) **≥ 6 שניות**.
   - כל שלב קשה/שווה לקודמו בכל ציר.
4. **Playtest אנושי** (למפתח/ילד בגיל היעד) — ההחלטה הסופית. אם שלב מרגיש קשה או
   קל מדי, הכיוונון הוא שינוי ערכים ב-`LEVELS` בלבד.

---

## 5. בדיקות שדורשות את המפתח (Slices 6, 10, 11)

סביבת ה-Preview אינה יכולה לאמת: שמיעת אודיו, מכשירים פיזיים, התקנת PWA ו-Service
Worker (נחסם בסביבה — ראו הערת M8). ה-Build יפיק **Checklist** מסודר ב-
`spec/QA-REPORT.md` עם עמודת "✅/❌ + הערות" למילוי:
- **Chrome Desktop, Edge Desktop:** זרימה מלאה, אודיו, Mute נשמר.
- **Chrome Mobile (Android), Edge Mobile:** Touch, Portrait/Landscape, סיבוב
  פיזי באמצע שלב, מוזיקה נעצרת ברקע (F7).
- **PWA:** התקנה, פתיחה Standalone, מצב טיסה → האפליקציה עולה ומשחק מתחיל,
  Statistics זמינים, עדכון גרסה (autoUpdate) אחרי Build חדש.
- **Close:** סגירת Tab/PWA באמצע משחק → פתיחה מחדש = מסך ראשי, ללא Resume, ללא שמירה.

> **איך לבדוק PWA בטלפון בלי Deploy:** Service Worker דורש HTTPS או `localhost`.
> `http://192.168.x.x` **לא** יאפשר SW/Install. הדרך ללא חשבון וללא Deploy:
> USB + Chrome Remote Debugging → `chrome://inspect` → Port forwarding
> `4173 → localhost:4173`, ואז `http://localhost:4173` בטלפון (Secure Context).
> ההוראות המלאות ייכנסו ל-QA-REPORT.

---

## 6. Final Visual Review (Slice 14)
- צילומי מסך (390×844) של 6 המסכים + HUD + Dialog + "שלב X הושלם", והשוואה מול
  `spec/mockups.png` ו-`spec/style-guide.png`: צבעים (טבלת DESIGN.md), Rubik,
  פינות מעוגלות, Glow בכפתורים, עקביות Spacing/Panels בין המסכים.
- פערים → תיקוני **CSS בלבד** (DESIGN.md מנצח בענייני UI). פער שדורש שינוי מבנה
  → לתעד ולשאול.
- צילומי המסך יישלחו למפתח בסיום.

---

## 7. Production Build (Slice 15)
1. `npm run build` (כולל `tsc -b`) — ללא שגיאות/אזהרות מהותיות.
2. `.claude/launch.json` — להוסיף קונפיגורציה `space-shooter-preview`
   (`npm run preview`, port 4173).
3. אימות ב-`vite preview`: כל המסכים נטענים, Deep link (`/statistics`) עובד,
   `manifest.webmanifest` + אייקונים נגישים, `sw.js` נוצר ומכיל precache של
   JS/CSS/HTML/PNG/WOFF2, אין Console Errors, `?level=` לא פעיל (§3.1).
4. גודל ה-Bundle — לתעד ב-QA-REPORT (ללא יעד מספרי; לשים לב לחריגות).
5. **אין Deploy ואין Commit** — לסיים בסיכום ולחכות לאישור.

---

## 8. סדר עבודה מוצע (Build)
1. **Vitest** — התקנה, config, helpers, ובדיקות על הקוד **הקיים** (חושף באגים לפני שינוי).
2. תיקוני קוד F2–F7 + בדיקות שמכסות אותם (F3 ו-F6 עם בדיקה שנכשלת לפני התיקון).
3. כיוונון `LEVELS` (§4) + `levels.test.ts`.
4. `?level=N` dev hook (§3.1).
5. אימות בדפדפן (§3) — תיעוד ממצאים, תיקון חוסמים.
6. Final Visual Review (§6) — תיקוני CSS.
7. **F1 — תרגום ההערות לאנגלית** (אחרי שינויי הלוגיקה, כדי למנוע diff כפול;
   מכסה גם קוד שנכתב בשלבים 2–4).
8. F8 (version, CLAUDE.md commands, `.gitkeep`), Production Build (§7).
9. כתיבת `spec/QA-REPORT.md` + עדכון `spec/MILESTONES.md` (סימון Slices + DoD).

## 9. קבצים שצפויים להשתנות
- **חדשים:** `vitest.config.ts`, `tsconfig.test.json`, `tests/helpers.ts`,
  `tests/{collision,enemy,spawner,gameEngine,storageService,levels}.test.ts`,
  `spec/QA-REPORT.md`, `spec/plans/milestone-9.md` (קובץ זה).
- **שינוי לוגיקה:** `src/game/GameEngine.ts` (F3, F4, startLevel),
  `src/game/Enemy.ts` (F3), `src/game/EnemySpawner.ts` (F6),
  `src/game/gameConfig.ts` (F6, §4), `src/hooks/useGameEngine.ts` (F5, §3.1),
  `src/hooks/useAudio.ts` + `src/services/audioService.ts` (F7),
  `src/services/storageService.ts` (F2).
- **שינוי תצורה:** `package.json` (+vitest, scripts, version), `tsconfig.json`,
  `.claude/launch.json`, `CLAUDE.md` (פקודות בלבד).
- **הערות בלבד (F1):** ~46 קבצים תחת `src/` ו-`tools/`.
- **אולי (לפי ממצאי §3/§6):** קובצי CSS של עמודים/רכיבים.
- **הסרה:** `src/services/.gitkeep`.

## 10. Definition of Done (מתוך MILESTONES.md — M9)
- [ ] כל 10 השלבים עובדים.
- [ ] ניתן לנצח ולהפסיד.
- [ ] כל חוקי המשחק עובדים (מכוסים ב-`npm test`).
- [ ] Statistics נשמרים נכון (כולל Non-Secure Context — F2).
- [ ] Audio עובד (כולל עצירה ברקע — F7).
- [ ] Responsive ו-Orientation עובדים (כולל Reposition נכון — F3/F4).
- [ ] PWA ו-Offline עובדים (Build מאומת; התקנה בפועל — Checklist למפתח).
- [ ] אין תקלות שחוסמות משחק מלא.
- [ ] העיצוב תואם ל-Mockups ול-Style Guide.
- [ ] `npm run build`, `npm test` ו-`oxlint` עוברים; 0 Console Errors.
- [ ] כל ההערות בקוד באנגלית (F1).
