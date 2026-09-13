# Milestone 5 – Complete Game UI & User Flows — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 5** מתוך `spec/MILESTONES.md`.
> מטרה: להשלים את כל המסכים והזרימות (User Flows) לפי ה-PRD וה-Mockups —
> מסך ראשי מלא, HUD מעוצב עם Sound Toggle, חסימת ניווט בזמן משחק, Confirmation
> Dialog לסיום יזום, סיום יזום שמחזיר למסך הראשי **בלי** לשמור, מסך Game Over
> מעוצב, מסכי How To Play ו-About מיושרים ל-Mockups, ויישור ויזואלי מלא של כל
> המסכים ל-Style Guide. בסוף M5 ניתן לבצע כל User Flow מתחילתו ועד סופו,
> והעיצוב תואם ל-Mockups.
>
> **לא** נכללים ב-Milestone זה:
> - שמירת תוצאה ב-`localStorage`, מסך סטטיסטיקות עם נתונים אמיתיים, שמירת
>   העדפת Sound — **M6** (ב-M5 מסך הסטטיסטיקות נשאר במצב "אין נתונים" כפי שהוא).
> - Audio אמיתי (מוזיקה, אפקטים), חיבור ה-Sound Toggle לאודיו בפועל, שילוב
>   Assets גרפיים סופיים (PNG/Sprite ללוגו, לתותח, לאויבים, לפיצוצים),
>   Polish של מעברים — **M7**.
> - Responsive מלא למובייל, Orientation, Touch Optimization, PWA ו-Offline — **M8**.
>
> **גבול קריטי לגבי Assets:** M5 מיישר את ה-UI ל-Mockups באמצעות **CSS + טוקני
> עיצוב + Emoji/Placeholders** בלבד (M5 Slice 9 מדבר על צבעים, spacing, borders,
> buttons, cards, typography — לא על אינטגרציית קבצי גרפיקה). החלפת ה-Placeholders
> ב-Assets אמיתיים (לוגו מצויר, תמונת תותח, ספרייטים) היא **M7 Slice 10**. אין
> לייבא קבצי PNG/גרפיקה ב-M5.

---

## 0. הקשר ונקודת מוצא

מה שקיים היום (Milestones 1–4 הושלמו):

- `src/App.tsx` — App Shell: `<Navigation />` קבוע מעל `<Routes>` לכל 6 הנתיבים.
  ההערה בקוד כבר מציינת שחסימת הניווט בזמן משחק היא M5.
- `src/components/navigation/Navigation.tsx` — תפריט Desktop + Hamburger מובייל,
  `NAV_ITEMS` (ראשי/סטטיסטיקות/איך לשחק/אודות). **אין** Sound Toggle, **אין**
  חסימה בזמן משחק (מתועד בהערה כ-M5).
- `src/pages/HomePage.tsx` — 🪐 Emoji, כותרת, tagline, קישור "התחל" ל-`/game`.
  שלד בלבד — לא מיושר ל-Mockup (אין wordmark מעוצב, אין איור תותח).
- `src/pages/GamePage.tsx` — `useGameEngine()`, `GameHud`, `LevelCompleteMessage`,
  וכפתור "סיים משחק" שמנווט **ישירות** ל-`/` (בלי Dialog). ניווט אוטומטי ל-
  `/game-over` עם `location.state` בעת won/lost.
- `src/components/game-ui/GameHud.tsx` — 4 פריטים (ניקוד/חיים/שלב/נותרו) כ-spans
  פשוטים. **אין** Sound Toggle. עיצוב מינימלי (`GameHud.css`).
- `src/pages/GameOverPage.tsx` — קורא `location.state`, מציג 🏆/💥 + כותרת +
  panel ניקוד/שלב + קישור "משחק חדש". Fallback ל-`/` אם אין state. עיצוב בסיסי.
- `src/pages/HowToPlayPage.tsx` — 5 סקשנים (Emoji + כותרת + טקסט) בתוך `.panel`.
- `src/pages/AboutPage.tsx` — 🪐 + כותרת + גרסה 1.0 + טקסט + קרדיט.
- `src/pages/StatisticsPage.tsx` — שלד: כותרת + מבנה טבלה + מצב "אין נתונים"
  (`hasResults = false` קבוע). **נשאר כפי שהוא ב-M5** (נתונים אמיתיים = M6).
- `src/components/common/Button.tsx` — כפתור משותף, variants: `primary` / `success`
  / `danger` / `ghost`. `Button.css` קיים.
- `src/hooks/useGameEngine.ts` — יוצר `GameEngine`, מאזין ל-Resize/Input, מנקה
  ב-unmount. מחזיר `{ containerRef, canvasRef, stats }`. ה-Engine נוצר **בתוך**
  ה-`useEffect` ואינו נגיש לקוד חיצוני (רלוונטי ל-Slice 4 — ראו §7).
- `src/game/GameEngine.ts` — `start()` / `stop()` / `destroy()` קיימים;
  `stop()` עוצר את הלולאה, `start()` מפעילה מחדש.
- `src/game/GameLoop.ts` — `start()` מאפס `lastTimeMs = null` ⇒ ה-Frame הראשון
  אחרי start מחזיר `deltaSeconds = 0`. **מסקנה חשובה:** `stop()` ואז `start()`
  (Pause/Resume עבור ה-Dialog) בטוח — אין קפיצת Delta ענקית בחזרה.
- `src/styles/global.css` — reset, רקע חלל (כוכבים ב-CSS), `.panel`, `.page`,
  `.page__title`, `.caption`, focus-visible נגיש. `src/styles/variables.css` —
  טוקני צבע/טיפוגרפיה/spacing/radius/glow לפי ה-Style Guide.
- `src/types/navigation.ts` — `ROUTES`, `NAV_ITEMS`, `GameOverState`.

M4 תוכנן במפורש כנקודת הרחבה ל-M5 (ראו `spec/plans/milestone-4.md §12`):
כפתור "סיים משחק" נשאר ב-`GamePage` (M5 יעטוף ב-Dialog), `status === 'playing'`
הוא הסימן לחסימת ניווט, `GameHud` מקבל הכל כ-props (M5 יוסיף Sound Toggle +
עיצוב), `GameOverPage` כבר קורא `location.state` (M5 יעצב, M6 יוסיף שמירה).

אין צורך בשום חשבון, סיסמה או מפתח API עבור Milestone 5 — הכל מקומי, Frontend בלבד.

---

## 1. החלטות טכניות ל-Milestone זה

| נושא | החלטה | נימוק / מקור |
|------|--------|--------------|
| Sound Toggle — היקף ב-M5 | לבנות את **ה-UI ואת ה-State בזיכרון** בלבד: אייקון Sound On/Off שמחליף מצב. **בלי** אודיו אמיתי (M7) ו**בלי** localStorage (M6) | MILESTONES M5 Slice 2 מגדיר Sound Toggle כחלק מה-HUD; §2 מוסיף אודיו; §32/§49 מוסיפים persistence — שכבות טבעיות, לא סתירה |
| State של Sound | React Context יחיד — `SoundContext` עם `{ muted: boolean; toggle() }`, ברירת מחדל `muted = false` | ARCHITECTURE §32 (State יחיד `soundMuted`), §50 (Context כשנדרש) |
| מיקום ה-Sound Toggle | רכיב משותף `SoundToggle` שמוצג פעמיים: ב-`Navigation` (מסכים שאינם משחק) וב-`GameHud` (מסך משחק). שניהם צורכים את אותו Context | DESIGN — אייקון Sound מופיע ב-Home ובמסך המשחק; ARCHITECTURE §32 (מצב יחיד) |
| חסימת ניווט בזמן משחק | **הסתרת** ה-`Navigation` כאשר הנתיב הוא `/game` (הנתיב הוא Proxy תקין ל"משחק פעיל") | PRD §4.2, ARCHITECTURE §39; Mockup של מסך המשחק — אין Hamburger |
| ניווט במסך Game Over | ה-`Navigation` **מוצג** ב-`/game-over` (אינו משחק פעיל) | PRD §4.2 חוסם רק "משחק פעיל"; מונע מבוי סתום ממסך הסיום (ראו החלטה 2 למטה) |
| Confirmation Dialog | רכיב `Modal` משותף חדש (`common/`), נגיש (role=dialog, Esc, לכידת רקע). טקסט + "ביטול" / "סיים משחק" | PRD §4.14, ARCHITECTURE §40 |
| הקפאת המשחק בזמן ה-Dialog | פתיחת ה-Dialog קוראת `engine.stop()`; "ביטול" קורא `engine.start()`. **אין** זו תכונת Pause למשתמש — זו מודליות של Dialog בלבד | ARCHITECTURE §40 ("מפסיק את Game Loop"); PRD §7 אוסר **Pause feature** למשתמש, לא הקפאת Dialog |
| חשיפת Pause/Resume | `useGameEngine` יאחסן את ה-Engine ב-`ref` ויחזיר `pause()` / `resume()` יציבים | נדרש כי ה-Engine נוצר בתוך ה-useEffect; GameLoop.start() כבר מאפס Delta |
| סיום יזום (Flow 7) | "סיים משחק" → Dialog → אישור: ניווט ל-`/` (`ROUTES.home`). **לא** נשמר בסטטיסטיקות (אין localStorage ב-M5 בכלל) | PRD §4.14, Flow 7; ARCHITECTURE §28, §40 |
| מסך סטטיסטיקות | נשאר כמצב "אין נתונים" (Slice של M5 הוא "מסך סטטיסטיקות" רק במובן ה-**עיצוב** — אבל הצגת נתונים אמיתיים היא M6) | MILESTONES M6 Slices 6–8; ראו החלטה 3 |
| Assets גרפיים | wordmark "SPACE SHOOTER" ואיורים ממומשים ב-**CSS/Emoji Placeholders**; החלפה ל-PNG/Sprite = M7 | MILESTONES M7 Slice 10; M5 Slice 9 = מערכת ויזואלית, לא קבצים |
| לוגו/Wordmark משותף | רכיב `Wordmark` משותף (`common/`) — משמש ב-Home וב-About | DESIGN — אותו לוגו בשני המסכים; ARCHITECTURE §62 (רכיבים קטנים, שימוש חוזר) |
| מנוע המשחק | **לא משתנה** ב-M5 (מלבד אולי שימוש חוזר ב-start/stop). כל העבודה היא React/CSS | ARCHITECTURE §51 (הפרדה React ↔ Engine) |
| localStorage | **אין** שום כתיבה/קריאה ל-localStorage ב-M5 | ARCHITECTURE §49 — Service מרוכז מגיע ב-M6 |

### החלטות שאינן מוגדרות במפורש באף מסמך

לפי `ARCHITECTURE §66.3` ("אם דרישה טכנית אינה מוגדרת בשני המסמכים — לבחור
בפתרון הפשוט ביותר שמתאים ל-MVP"). כולן מתועדות כאן ומסומנות לתשומת לב המפתח
בבדיקת ה-Milestone; אינן דורשות עצירה מוקדמת:

1. **היקף ה-Sound Toggle ב-M5.** הבחירה היא לממש רק את שכבת ה-UI וה-State
   בזיכרון (אייקון שמתחלף), בלי אודיו (M7) ובלי persistence (M6). זהו הפירוש
   הפשוט ביותר שמכבד את גבולות ה-Milestones ואת ה-Mockups. ה-`SoundContext`
   מתוכנן כך ש-M6 יזריק פנימה `getSoundMuted/setSoundMuted` ו-M7 יגיב ל-`muted`
   ב-Audio Service — **בלי** שכתוב הרכיבים הצורכים אותו.

2. **ניווט במסך Game Over.** ה-Mockup של מסך הסיום אינו מציג Hamburger, אך
   הסתרת הניווט שם עלולה "לכלוא" את המשתמש (הזרימה היחידה היא "משחק חדש").
   ההחלטה: להציג את ה-`Navigation` ב-`/game-over` (אינו משחק פעיל; PRD חוסם רק
   משחק פעיל). כך ניתן להגיע לסטטיסטיקות/אודות גם מהמסך הזה. **סומן לאישור המפתח.**

3. **מסך סטטיסטיקות ב-M5.** MILESTONES רושם "מסך סטטיסטיקות" תחת M6 (Slices
   6–8), ולא תחת M5. לכן ב-M5 המסך נשאר במצב "עדיין אין משחקים קודמים להצגה"
   (כפי שהוא היום), ורק **יישור ויזואלי** של הכותרת/הטבלה ל-Mockup נעשה כחלק
   מ-Slice 9. הצגת נתונים אמיתיים ומיון — M6.

4. **הקפאת המשחק בזמן ה-Confirmation Dialog.** ARCHITECTURE §40 אומר שאישור
   "מפסיק את Game Loop", אך אינו מתייחס למצב בזמן שה-Dialog פתוח. הותרת המשחק
   רץ מתחת ל-Dialog עלולה לגרום לאיבוד חיים בזמן שהמשתמש מתלבט — לא הוגן למשחק
   ילדים. ההחלטה: להקפיא (`engine.stop()`) בזמן שה-Dialog פתוח, ולהמשיך
   (`engine.start()`) ב"ביטול". זו אינה תכונת Pause למשתמש (שאסורה ב-PRD §7) —
   אין כפתור Pause, וההקפאה קשורה אך ורק למודליות ה-Dialog.

5. **Sound Toggle ללא אודיו — מה קורה בלחיצה.** בלחיצה מתחלף האייקון בלבד
   (🔊 ↔ 🔇) וה-State מתעדכן. אין משוב קולי (אין אודיו ב-M5). התנהגות זו
   תקינה ל-MVP ותקבל משמעות מלאה ב-M7.

> אם במהלך הבנייה תתעורר סתירה אמיתית שכלל התחומים אינו פותר — **לעצור ולשאול**
> לפי `CLAUDE.md`.

---

## 2. מפת הקבצים (יצירה / שינוי)

**ליצור:**

```text
src/context/SoundContext.tsx                     ← Context + Provider: { muted, toggle } (בזיכרון)
src/components/common/SoundToggle.tsx            ← אייקון Sound On/Off משותף (צורך SoundContext)
src/components/common/SoundToggle.css
src/components/common/Modal.tsx                  ← Dialog נגיש משותף (role=dialog, Esc, overlay)
src/components/common/Modal.css
src/components/common/Wordmark.tsx               ← "SPACE SHOOTER" מעוצב (CSS placeholder) — Home + About
src/components/common/Wordmark.css
src/components/game-ui/ConfirmEndGameDialog.tsx  ← עטיפה דקה של Modal עם טקסט/כפתורי סיום משחק
```

**לשנות:**

```text
src/main.tsx (או App.tsx)         ← עטיפת האפליקציה ב-<SoundProvider>
src/App.tsx                       ← הסתרת <Navigation /> בנתיב /game (Slice 3)
src/components/navigation/Navigation.tsx ← הוספת <SoundToggle /> לשורת העליונה; הסרת הערת "M5"
src/components/navigation/Navigation.css ← מיקום ה-Sound Toggle (RTL: אייקון בצד, Hamburger בצד)
src/pages/HomePage.tsx / .css     ← Slice 1: Wordmark + איור תותח (placeholder) + כפתור "התחל" גדול
src/components/game-ui/GameHud.tsx / .css ← Slice 2: כרטיסי HUD מעוצבים + SoundToggle
src/pages/GamePage.tsx / .css     ← Slice 4+5: Confirmation Dialog + pause/resume; עיצוב פריסת המשחק
src/hooks/useGameEngine.ts        ← החזרת pause()/resume() (אחסון Engine ב-ref)
src/pages/GameOverPage.tsx / .css ← Slice 6: יישור מלא ל-Mockup (טרופי/פיצוץ, panel ניקוד/שלב, כפתור)
src/pages/HowToPlayPage.tsx / .css ← Slice 7: יישור ל-Mockup (כרטיסים, כרטיס 3 גדלי אויבים)
src/pages/AboutPage.tsx / .css    ← Slice 8: יישור ל-Mockup (Wordmark משותף, גרסה, טקסט, קרדיט)
src/pages/StatisticsPage.css      ← Slice 9: יישור ויזואלי בלבד (המצב "אין נתונים" נשאר)
src/styles/variables.css          ← (אם נדרש) טוקנים נוספים ל-glow/gradient של כותרות
spec/MILESTONES.md                ← סימון Slices 1–9 של M5 כ-✅ תוך כדי העבודה
```

**לא לגעת ב-M5:** כל `src/game/**` (מלבד השימוש ב-`start/stop` הקיימים דרך ה-Hook),
`src/game/GameEngine.ts` עצמו, `Renderer`, `Enemy`, `Projectile`, `LevelManager`,
`gameConfig.ts`, `src/types/game.ts`. אין localStorage, אין Audio, אין Assets גרפיים.

---

## 3. Sound State — `SoundContext` + `SoundToggle` (תשתית ל-Slice 2 ול-Home)

### 3.1 `src/context/SoundContext.tsx`

```ts
interface SoundContextValue {
  muted: boolean;
  toggle: () => void;
}
```

- `SoundProvider` מחזיק `useState(false)` (ברירת מחדל לא מושתק — ARCHITECTURE §48).
- `toggle()` הופך את `muted`.
- Hook נוח `useSound()` שזורק אם נעשה בו שימוש מחוץ ל-Provider.
- **הכנה ל-M6/M7 (בלי לממש עכשיו):** בהערה מתועד שב-M6 הערך יאותחל מ-
  `storageService.getSoundMuted()` ו-`toggle` יקרא ל-`setSoundMuted`, וב-M7
  ה-Audio Service יאזין ל-`muted`. עכשיו — בזיכרון בלבד.

### 3.2 עטיפת האפליקציה

ב-`main.tsx`: `<SoundProvider><App /></SoundProvider>` (מתחת ל-`BrowserRouter`
הקיים). כך גם `Navigation` וגם `GameHud` נמצאים תחת אותו Provider ומשתפים מצב.

### 3.3 `src/components/common/SoundToggle.tsx`

- כפתור אייקון: `🔊` כאשר `!muted`, `🔇` כאשר `muted`.
- `aria-label` דינמי: "השתקת הקול" / "הפעלת הקול" (ARCHITECTURE §55 — aria-label
  לאייקון ללא טקסט).
- `aria-pressed={muted}`.
- קורא ל-`toggle()` מה-Context ב-`onClick`.
- Prop אופציונלי `className` להתאמת מיקום (Navigation מול HUD).
- גודל מגע ≥ `--touch-target-min` (44px).

---

## 4. Slice 1 — מסך ראשי מלא (`HomePage`)

מטרה (PRD §4.1, DESIGN — Mockup "ראשי"): לוגו/wordmark זוהר, איור תותח יורה,
כפתור "התחל" גדול וירוק. Sound + Hamburger מגיעים מה-`Navigation` שמעליו.

- **Wordmark:** רכיב `Wordmark` משותף (§8) — "SPACE" בשורה עליונה ו-"SHOOTER"
  מתחתיו, בטיפוגרפיה גדולה עם Gradient (טורקיז→כחול / כתום לפי ה-Mockup) ו-Glow
  (`--glow-primary` / `--glow-purple`). מיושם ב-CSS בלבד (Placeholder עד M7).
- **איור תותח + לייזר:** Placeholder ויזואלי (Emoji גדול או צורת CSS — למשל
  🔫/🚀 עם קו לייזר בגרדיאנט סגול/ורוד). מוחלף באיור אמיתי ב-M7 Slice 10.
- **כפתור "התחל":** גדול, `variant="success"` (ירוק `--color-success`), רוחב
  נדיב, פינות מעוגלות מאוד, Glow. נשאר `Link`/כפתור המנווט ל-`ROUTES.game`
  (התחלת משחק חדש בשלב 1 — הלוגיקה כבר קיימת דרך יצירת Engine חדש ב-mount).
- פריסה: מרכוז אנכי, רקע החלל הגלובלי (global.css) משמש כרקע.

`HomePage.css`: יישור ל-Mockup — spacing, גודל כותרת, glow, גודל הכפתור.

---

## 5. Slice 2 — Game HUD מעוצב + Sound Toggle (`GameHud`)

מטרה (PRD §4.3, ARCHITECTURE §41, DESIGN — Mockup "משחק"): שורת HUD קומפקטית
וקריאה מעל אזור המשחק, עם 4 כרטיסים + Sound Toggle. אסור שה-HUD יסתיר חלק
משמעותי מאזור המשחק (§41).

מבנה לפי ה-Mockup (מימין לשמאל ב-RTL): [Sound] ואז כרטיסים
`👾 נותרו`, `📊 שלב`, `❤️ חיים`, `⭐ ניקוד`. כל כרטיס = אייקון + תווית קטנה +
מספר בולט, על רקע `--color-bg-panel` עם border `--color-border`, פינות מעוגלות.

- **Props:** נשארים `score`, `lives`, `currentLevel`, `enemiesRemaining` (ללא
  שינוי מ-M4). ה-Sound Toggle **אינו** prop — הרכיב צורך את `SoundContext` ישירות.
- **מבנה כרטיס:** לחלץ תת-רכיב פנימי `HudStat` (icon, label, value) לקריאוּת
  ולעקביות; לא חובה כרכיב נפרד בקובץ.
- **צבעים לפי Style Guide:** ניקוד בגוון צהוב `--color-accent-yellow`, חיים
  בגוון `--color-danger` (לב), וכו' — אייקונים צבעוניים (§HUD ב-DESIGN).
- `GameHud.css`: כרטיסים ב-Flex, `gap` קטן, `flex-wrap` לשמירה על קריאוּת
  במסכים צרים; מספרים ב-`font-weight-bold`. יישור סופי מלא ל-Mockup.

---

## 6. Slice 3 — חסימת Navigation בזמן משחק

מטרה (PRD §4.2, ARCHITECTURE §39): בזמן משחק פעיל אין לנווט למסכים אחרים;
יציאה רק דרך "סיים משחק".

**מימוש:** ב-`App.tsx`, הסתרת `<Navigation />` כאשר הנתיב הוא `/game`.

```tsx
const location = useLocation();
const isActiveGame = location.pathname === ROUTES.game;
// ...
{!isActiveGame && <Navigation />}
<Routes> ... </Routes>
```

- הנתיב `/game` נכנס רק דרך "התחל"/"משחק חדש", ונעזב רק דרך "סיים משחק" (→ `/`)
  או win/loss (→ `/game-over`). לכן `pathname === '/game'` הוא Proxy מדויק
  ל"משחק פעיל", בלי צורך ב-Game State גלובלי ב-`Navigation` (פשטות — §66.3).
- ב-`/game-over` ובכל שאר המסכים ה-`Navigation` **מוצג** (החלטה 2).
- הסרת ההערה "M5" מ-`Navigation.tsx` ומ-`App.tsx`.

> חלופה שנשקלה ונדחתה: להשאיר את ה-Navigation מוצג אך Disabled. ה-Mockup של מסך
> המשחק אינו כולל Hamburger כלל, ולכן הסתרה מלאה נאמנה יותר לעיצוב (§39 מתיר את שתי
> הגישות: "להסתיר או Disabled").

---

## 7. Slice 4 + 5 — Confirmation Dialog וסיום יזום

מטרה (PRD §4.14, Flow 7, ARCHITECTURE §40): "סיים משחק" → Dialog "האם אתה בטוח
שברצונך לסיים את המשחק?" → ביטול (המשחק ממשיך) / אישור (חזרה למסך הראשי, בלי שמירה).

### 7.1 `src/components/common/Modal.tsx` (רכיב נגיש משותף)

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` לכותרת.
- Overlay כהה (`--color-overlay`) שממלא את המסך; לחיצה על הרקע = ביטול (סגירה).
- `Esc` = ביטול. מיקוד ראשוני על כפתור הפעולה; מניעת גלילת רקע (בסיסי).
- `children` לתוכן; `onClose` ל-callback.
- `Modal.css`: panel ממורכז, פינות מעוגלות מאוד, `--shadow-panel`, Glow עדין.

### 7.2 `src/components/game-ui/ConfirmEndGameDialog.tsx`

עטיפה דקה של `Modal`:
- כותרת/טקסט: "האם אתה בטוח שברצונך לסיים את המשחק?"
- כפתורים: `Button variant="ghost"` "ביטול" (→ `onCancel`), `Button
  variant="danger"` "סיים משחק" (→ `onConfirm`).

### 7.3 שינוי ב-`useGameEngine` — חשיפת Pause/Resume

ה-Engine נוצר בתוך ה-`useEffect` ואינו נגיש כרגע. שינוי מינימלי:

```ts
const engineRef = useRef<GameEngine | null>(null);
// בתוך ה-useEffect: engineRef.current = engine;  ובניקוי: engineRef.current = null;

const pause  = useCallback(() => engineRef.current?.stop(),  []);
const resume = useCallback(() => engineRef.current?.start(), []);
return { containerRef, canvasRef, stats, pause, resume };
```

- `pause` = `engine.stop()` (עצירת הלולאה). `resume` = `engine.start()`.
- `GameLoop.start()` מאפס `lastTimeMs` ⇒ אין קפיצת Delta בחזרה (§0). בטוח גם אם
  ה-status היה `level-complete`/`player-hit` — ה-Timers פשוט קופאים וממשיכים.
- אין שינוי ב-`GameEngine.ts` עצמו — רק שימוש ב-API הקיים.

### 7.4 שינוי ב-`GamePage`

```tsx
const [confirmOpen, setConfirmOpen] = useState(false);
const { containerRef, canvasRef, stats, pause, resume } = useGameEngine();

function requestEnd()  { pause();  setConfirmOpen(true); }   // Slice 4 — פותח Dialog + מקפיא
function cancelEnd()   { setConfirmOpen(false); resume(); }  // ביטול — ממשיך
function confirmEnd()  { setConfirmOpen(false); navigate(ROUTES.home); } // Slice 5 — בלי שמירה
```

- כפתור "סיים משחק" קורא כעת ל-`requestEnd` (במקום `navigate(ROUTES.home)` ישיר).
- `confirmEnd` מנווט ל-`/` — עם ה-unmount של `GamePage` נקרא `engine.destroy()`
  (Cleanup מלא, ARCHITECTURE §53). **אין** שמירה ל-localStorage (PRD §4.14).
- ה-Dialog מוצג כאשר `confirmOpen` — מעל אזור המשחק.
- ניווט אוטומטי ל-`/game-over` בעת won/lost נשאר כפי שהוא (M4). אם המשחק הסתיים
  (won/lost) בזמן שה-Dialog פתוח — לא רלוונטי, כי בזמן ה-Dialog הלולאה מוקפאת
  ולא ניתן להגיע ל-won/lost.

---

## 8. Slice 6 — מסך Game Over מעוצב (`GameOverPage`)

מטרה (PRD §4.13, DESIGN — Mockup "סיום משחק"): המחשה ברורה של ניצחון/הפסד,
ניקוד סופי, שלב שהושג, כפתור "משחק חדש".

- הלוגיקה קיימת (קריאת `location.state`, Fallback ל-`/`). M5 = **עיצוב** בלבד.
- **ניצחון:** אייקון טרופי 🏆 (עם Glow/קונפטי ב-CSS), כותרת "ניצחון!" בגוון
  `--color-accent-yellow` עם Glow (ה-Mockup מציג צהוב זוהר).
- **הפסד:** אייקון 💥, כותרת "הפסד" בגוון `--color-danger`.
- **Panel תוצאות:** "ניקוד סופי: <ערך>" ו-"השלב שהושג: <ערך>" — מספרים בולטים
  (ניקוד בטורקיז, שלב בסגול לפי ה-Mockup), בתוך `.panel`.
- **כפתור "משחק חדש":** גדול, `variant="success"`, מנווט ל-`ROUTES.game`
  (Engine חדש = שלב 1 / 3 חיים / 0 ניקוד — קיים).
- `GameOverPage.css`: מרכוז, glow לכותרת, עיצוב ה-panel והכפתור לפי ה-Mockup.
- **הכנה ל-M6 (בלי לממש):** שמירת התוצאה ב-localStorage תיעשה ב-`GamePage`
  **לפני** הניווט ל-`/game-over` (M6), לא כאן.

---

## 9. Slice 7 — מסך "איך לשחק" (`HowToPlayPage`)

מטרה (PRD §4.16, DESIGN — Mockup "איך לשחק"): כרטיסים קצרים — מטרת המשחק, איך
משחקים (עם 3 גדלי אויבים), חיים, מעבר שלב, הפסד.

- התוכן קיים (5 סקשנים). M5 = **יישור ל-Mockup**:
  - כרטיסים על רקע `--color-bg-panel` עם border ואייקון צבעוני בצד (RTL: אייקון
    בצד ההתחלה).
  - **כרטיס "איך משחקים"**: להוסיף שורת שלושת גדלי האויבים (קטן/בינוני/גדול עם
    "פגיעה 1 / 2 פגיעות / 3 פגיעות") כתת-רכיב ויזואלי, לפי ה-Mockup (שלוש
    יצורים בשורה). Placeholders (Emoji 👾 בגדלים שונים) עד M7.
  - כותרת המסך "איך לשחק" ממורכזת (`.page__title` קיים).
- `HowToPlayPage.css`: מרווחים, יישור אייקון-טקסט, כרטיס האויבים.

---

## 10. Slice 8 — מסך "אודות" (`AboutPage`)

מטרה (PRD §4.17, DESIGN — Mockup "אודות"): לוגו, "Space Shooter", גרסה 1.0,
טקסט קצר, קרדיט "אסף פינקלשטיין".

- להחליף את ה-🪐 + כותרת הנוכחיים ב-`Wordmark` המשותף (§8) — עקביות עם Home.
- מתחת: "גרסה 1.0" (`.caption`), טקסט קצר (קיים), קרדיט "מתכנת: אסף פינקלשטיין".
- `AboutPage.css`: מרכוז, spacing, קו מפריד עדין מעל הקרדיט (לפי ה-Mockup),
  צבעים לפי ה-Style Guide.

---

## 11. Slice 9 — יישור ויזואלי מלא ל-Mockups (כל המסכים)

מטרה (MILESTONES M5 Slice 9): צבעים, Spacing, Borders, Buttons, Cards,
Typography — עקביים בין כל המסכים ותואמים ל-Style Guide.

- **מעבר ביקורת על כל מסך** מול ה-Mockup: Home, Game (HUD), Statistics,
  How To Play, About, Game Over.
- לוודא שכל הצבעים מגיעים מטוקני `variables.css` (אין hex קשיח בקומפוננטות).
- לוודא שכל הכפתורים משתמשים ב-`Button`/`.btn` ובווריאנטים הנכונים.
- לוודא שכל ה-Cards משתמשים ב-`.panel` או מבנה עקבי.
- טיפוגרפיה: כותרות Rubik Bold, גופן גוף Regular, גדלים מטוקנים.
- **מסך סטטיסטיקות:** יישור ויזואלי של הכותרת ומבנה הטבלה/מצב-ריק בלבד — הנתונים
  האמיתיים והמיון הם M6 (החלטה 3). מבנה הטבלה כבר קיים בשלד.
- RTL: לוודא שכל המסכים והטבלה מוצגים מימין לשמאל (global `dir="rtl"` קיים).
- טוקנים חדשים ב-`variables.css` רק אם באמת נדרשים (למשל gradient לכותרות).

> Responsive מלא למובייל/Landscape ו-Orientation — **M8**. ב-M5 נשמרת גישת
> Mobile First הקיימת, אך אין לבצע כאן את עבודת ה-Orientation/Touch של M8.

---

## 12. תוכנית בדיקה ידנית ל-Milestone 5

| # | תרחיש | תוצאה מצופה |
|---|--------|--------------|
| 1 | מסך ראשי | Wordmark "SPACE SHOOTER" זוהר, איור תותח (placeholder), כפתור "התחל" גדול ירוק; Hamburger + Sound למעלה |
| 2 | לחיצה "התחל" | מעבר ל-`/game`, משחק חדש שלב 1 / 3 חיים / 0 ניקוד |
| 3 | מסך משחק — HUD | 4 כרטיסים מעוצבים (נותרו/שלב/חיים/ניקוד) + אייקון Sound; לא מסתירים את אזור המשחק |
| 4 | Sound Toggle (Home) | לחיצה מחליפה 🔊 ↔ 🔇; ה-`aria-pressed` מתעדכן (אין אודיו — M7) |
| 5 | Sound Toggle משותף | שינוי המצב במסך אחד נשמר במעבר למסך אחר (Context אחד) |
| 6 | ניווט בזמן משחק | ב-`/game` אין Navigation/Hamburger כלל (חסום) |
| 7 | "סיים משחק" | נפתח Dialog "האם אתה בטוח…"; המשחק **קופא** (אויבים לא זזים) |
| 8 | Dialog — "ביטול" | ה-Dialog נסגר; המשחק **ממשיך** מהמקום שבו קפא (אין קפיצה) |
| 9 | Dialog — "סיים משחק" | חזרה ל-`/` (מסך ראשי); המשחק לא נשמר (אין localStorage בכלל) |
| 10 | Dialog — Esc / לחיצה על רקע | נסגר כמו "ביטול"; המשחק ממשיך |
| 11 | ניצחון (שלב 10) | מסך Game Over מעוצב: 🏆 "ניצחון!" צהוב זוהר, ניקוד/שלב, "משחק חדש" |
| 12 | הפסד (3 חיים) | מסך Game Over מעוצב: 💥 "הפסד" אדום, ניקוד/שלב נכונים |
| 13 | "משחק חדש" | משחק נקי: שלב 1, 3 חיים, 0 ניקוד |
| 14 | ניווט ממסך Game Over | ה-Navigation מוצג; ניתן להגיע לסטטיסטיקות/אודות (החלטה 2) |
| 15 | מסך "איך לשחק" | כרטיסים מיושרים ל-Mockup, כולל שורת 3 גדלי אויבים |
| 16 | מסך "אודות" | Wordmark משותף, גרסה 1.0, טקסט, קרדיט "אסף פינקלשטיין" |
| 17 | מסך סטטיסטיקות | כותרת + מצב "עדיין אין משחקים קודמים להצגה" מעוצב (נתונים אמיתיים — M6) |
| 18 | RTL בכל המסכים | כל ה-UI מימין לשמאל; אין hex קשיח בקומפוננטות |
| 19 | יציאה ל-`/` בזמן משחק וחזרה | Engine חדש; אין Game Loop שנשאר פעיל; אין כפילות (StrictMode) |
| 20 | Console לאורך כל ה-Flows | אין שגיאות; אין Listener/Loop שנשאר תלוי |
| 21 | `npm run build` | עובר; אפס שגיאות TypeScript; אין `any` |
| 22 | `npm run lint` | עובר נקי |

---

## 13. Definition of Done ל-Milestone 5

מתוך `MILESTONES.md` (Definition of Done של M5) + דרישות הקוד (`ARCHITECTURE §61`):

- [ ] מסך ראשי מלא: Wordmark, איור תותח (placeholder), כפתור "התחל" גדול.
- [ ] Game HUD מעוצב: ניקוד, חיים, שלב, אויבים שנותרו — כולם אמיתיים — + Sound Toggle.
- [ ] הניווט חסום בזמן משחק פעיל (`/game`); יציאה רק דרך "סיים משחק".
- [ ] Confirmation Dialog "האם אתה בטוח שברצונך לסיים את המשחק?" עם ביטול/אישור.
- [ ] "ביטול" ממשיך את המשחק; "אישור" מחזיר למסך הראשי **בלי** לשמור בסטטיסטיקות.
- [ ] מסך Game Over מעוצב לפי ה-Mockup (ניצחון/הפסד, ניקוד סופי, שלב, "משחק חדש").
- [ ] מסך "איך לשחק" מיושר ל-Mockup (כולל 3 גדלי אויבים).
- [ ] מסך "אודות" מיושר ל-Mockup (Wordmark, גרסה 1.0, טקסט, קרדיט).
- [ ] יישור ויזואלי מלא של כל המסכים ל-Style Guide (צבעים/spacing/borders/buttons/cards/typography).
- [ ] ניתן לבצע את כל ה-User Flows (1–8) מתחילתם ועד סופם.
- [ ] Sound Toggle: UI + State בזיכרון בלבד (בלי אודיו/persistence — M7/M6). מצב יחיד משותף.
- [ ] מנוע המשחק (`src/game/**`) לא שונה מלבד שימוש ב-`start/stop` הקיימים.
- [ ] אין localStorage, אין Audio אמיתי, אין Assets גרפיים סופיים ב-M5.
- [ ] `src/game/` עדיין אינו מייבא React; אין Re-render לכל Frame.
- [ ] Cleanup מלא ביציאה ממסך המשחק; אין Game Loop פעיל אחרי מעבר מסך.
- [ ] `npm run build` ו-`npm run lint` עוברים ללא שגיאות; אין `any`.
- [ ] אין Console Errors בשימוש רגיל.
- [ ] כל Slices 1–9 של Milestone 5 מסומנים ✅ ב-`spec/MILESTONES.md`.

---

## 14. הכנה ל-Milestone 6 (לא לממש עכשיו)

הפרדות שכדאי לשמור ב-M5 כדי ש-M6 (Persistence & Statistics) יתחבר בלי שכתוב —
**בלי** לכתוב קוד עבורן עכשיו:

- `SoundContext` מתוכנן כך ש-M6 יאתחל את `muted` מ-`storageService.getSoundMuted()`
  ו-`toggle` יקרא ל-`setSoundMuted` — הרכיבים הצורכים (`SoundToggle`) לא ישתנו.
- שמירת תוצאת המשחק תיעשה ב-M6 בתוך `GamePage`, **לפני** הניווט ל-`/game-over`
  (בנקודה שבה כבר יש `won`/`lost` + score + level). סיום יזום (Flow 7) כבר
  **אינו** שומר — נשאר כך.
- `StatisticsPage` כבר בנוי סביב דגל `hasResults` ומבנה טבלה — M6 יחליף את הדגל
  הקבוע בקריאה מ-`storageService.getStatistics()` וימלא שורות ממוינות.
- `Modal` המשותף זמין לשימוש חוזר בכל Dialog עתידי.

---

## 15. עצירות ונקודות אישור (לפי `CLAUDE.md`)

- **לא לבצע `git commit` ולא deploy** בלי אישור מפורש מהמפתח.
- אין צורך בחשבונות/מפתחות ל-M5 — אם בכל זאת יתעורר צורך, **לעצור ולשאול**.
- בסיום Milestone 5 — **לעצור ולהמתין לבדיקת המפתח** לפני מעבר ל-Milestone 6.
- שתי החלטות סומנו לתשומת לב מיוחדת בבדיקה (§1): (א) היקף ה-Sound Toggle כ-UI
  בלבד ב-M5; (ב) הצגת ה-Navigation במסך Game Over. אם המפתח מעדיף אחרת — קל
  לשנות, ורצוי לסכם לפני המימוש.
- כל סתירה אמיתית בין מסמכים שאינה נפתרת בכלל התחום → **לשאול לפני החלטה**.
