# Milestone 1 – Project Foundation — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 1** מתוך `spec/MILESTONES.md`.
> מטרה: להקים את בסיס הפרויקט, מבנה התיקיות, Routing, RTL, Global Styles,
> שלד לכל המסכים, Navigation בסיסי והשפה הגרפית הראשונית.
> **לא** נכללים במיילסטון זה: Canvas, Game Loop, תותח, אויבים, לוגיקת משחק,
> Audio, localStorage, PWA — אלו שייכים למיילסטונים 2–9.

---

## 0. הקשר ונקודת מוצא

- מצב נוכחי: הריפו מכיל רק `CLAUDE.md` ו־`spec/`. **אין עדיין קוד**.
- הפרויקט ייווצר **בשורש** `C:\Claude\Space Shooter` (לצד `spec/` ו־`CLAUDE.md`),
  לא בתת־תיקייה, כדי ש־`spec/` יישאר ליד הקוד.
- אין צורך בשום חשבון, סיסמה או מפתח API עבור Milestone 1 — הכל מקומי.

---

## 1. החלטות טכניות ל-Milestone זה

לפי `ARCHITECTURE.md` הכלל הוא Client-Side Routing ו-Frontend בלבד. ההחלטות הבאות
נופלות בבירור בתחום הטכנולוגי (ARCHITECTURE מנצח) ונבחר בהן הפתרון הפשוט ל-MVP:

| נושא | החלטה | נימוק |
|------|--------|--------|
| Build tool | **Vite** (`react-ts` template) | מפורש ב-ARCHITECTURE §1.1 ו-MILESTONES |
| Router | **react-router-dom v6** | ספריית ה-Client-Side Routing הסטנדרטית ל-React SPA |
| סוג Router | **BrowserRouter** | URLים נקיים; אם יתגלה קושי ב-refresh/offline בהמשך (M8) נשקול HashRouter — לא לשנות עכשיו |
| גופן Rubik | **`@fontsource/rubik`** (מותקן כ-dependency, מיובא בקוד) | גופן מקומי ⇐ תואם דרישת Offline (PRD/ARCHITECTURE §47) ומונע Remote Dependency; כולל subset עברי |
| State management | **ללא** (React state בלבד) | ARCHITECTURE §50 — אין Redux/Context ב-MVP אלא אם יוכח צורך |
| CSS | **CSS רגיל + CSS Variables** (`variables.css`, `global.css`) | תואם DESIGN + ARCHITECTURE §34; אין צורך ב-CSS framework |

> אם במהלך הבנייה תתעורר סתירה אמיתית שהכלל אינו פותר — **לעצור ולשאול** לפי CLAUDE.md.

---

## 2. יצירת הפרויקט (Slice 1)

1. יצירת פרויקט Vite בשורש עם template `react-ts`.
2. התקנת dependencies:
   - `react-router-dom`
   - `@fontsource/rubik`
3. ודא שה-scripts ב-`package.json` קיימים ועובדים:
   - `dev` — הרצת שרת פיתוח
   - `build` — build ל-production
   - `preview` — תצוגת ה-build
   - `lint` (אם נוצר ע"י התבנית) ו-`tsc`/type-check
4. `tsconfig` — `strict: true` (ARCHITECTURE §61 — להימנע מ-`any`).
5. עדכון `index.html`:
   - `<html lang="he" dir="rtl">`
   - `<title>Space Shooter</title>`
   - `theme-color` בסיסי `#0B1026` (הכנה ל-PWA; המניפסט המלא ב-M8)

**אימות Slice:** `npm run dev` עולה ללא שגיאות; דף ברירת מחדל נטען.

---

## 3. מבנה התיקיות (Slice 2)

יצירת המבנה תחת `src/` לפי `ARCHITECTURE.md §3`. תיקיות ששייכות למיילסטונים
מאוחרים ייווצרו עם `.gitkeep` כדי לשמר את המבנה בלי קוד מיותר:

```text
src/
├── components/
│   ├── navigation/      ← ייווצר בו קוד ב-M1 (Navigation)
│   ├── common/          ← .gitkeep (רכיבים משותפים בעתיד)
│   └── game-ui/         ← .gitkeep (HUD בעתיד, M3+)
├── pages/               ← ייווצר בו קוד ב-M1 (6 מסכים)
├── game/                ← .gitkeep (M2+)
├── services/            ← .gitkeep (M6/M7)
├── hooks/               ← .gitkeep (M2+)
├── types/               ← ייווצר בו קוד ב-M1 (routes.ts / navItems)
├── assets/
│   ├── images/          ← .gitkeep
│   ├── audio/           ← .gitkeep
│   └── icons/           ← .gitkeep
├── styles/              ← ייווצר בו קוד ב-M1 (global.css, variables.css)
├── App.tsx
└── main.tsx
```

> **לא** מכניסים לוגיקת משחק לתוך `pages/` — הפרדה בין UI למנוע נשמרת מההתחלה
> (ARCHITECTURE §2, §51). ב-M1 אין עדיין מנוע, רק שלדים.

**אימות Slice:** המבנה קיים ומופיע ב-git.

---

## 4. Routing (Slice 3)

ב-`App.tsx` הגדרת Routes (react-router-dom) עבור כל המסכים לפי `ARCHITECTURE.md §4`:

| Route | Component | הערה |
|-------|-----------|------|
| `/` | `HomePage` | מסך ראשי |
| `/game` | `GamePage` | שלד בלבד ב-M1 |
| `/statistics` | `StatisticsPage` | |
| `/how-to-play` | `HowToPlayPage` | |
| `/about` | `AboutPage` | |
| `/game-over` | `GameOverPage` | |
| `*` | הפניה ל-`/` | fallback ל-route לא מוכר |

- `BrowserRouter` יעטוף את האפליקציה ב-`main.tsx`.
- Layout משותף (App shell): רקע חלל + `Navigation` + `<Outlet />` לתוכן המסך.
- הערה על עתיד (לא לממש עכשיו): חסימת ניווט בזמן משחק פעיל היא **M5** — לא ב-M1.
  ב-M1 כל המסכים נגישים דרך התפריט.

**אימות Slice:** מעבר ידני בין כל 6 ה-URLים מציג את המסך המתאים; URL שגוי חוזר ל-`/`.

---

## 5. RTL + Global Styles + משתני עיצוב (Slice 4)

### 5.1 `src/styles/variables.css`
הגדרת CSS Variables לפי `DESIGN.md` (Style Guide):

```text
--color-primary:        #00E5FF   /* כפתורים ראשיים, קישורים */
--color-bg:             #0B1026   /* רקע חלל */
--color-bg-panel:       #1A1F3D   /* רקע משני / Panels / Cards */
--color-text:           #F8FAFF   /* טקסט ראשי */
--color-accent-purple:  #9B5CFF
--color-accent-yellow:  #FFC83D   /* ניקוד / הדגשה */
--color-danger:         #FF4D6D   /* שגיאה / כפתור "סיים משחק" */
--color-success:        #4CD964   /* הצלחה / "התחל" */

--font-family: 'Rubik', Arial, sans-serif;
--font-h1: 32px;  --font-h2: 24px;  --font-body: 16px;  --font-caption: 14px;

--radius-lg / --radius-md   /* פינות מעוגלות מאוד — כפתורים, Cards, Dialogs */
--spacing-*                 /* סקאלת מרווחים בסיסית */
```

### 5.2 `src/styles/global.css`
- `import '@fontsource/rubik'` (משקלים 400 ו-700) — ב-`main.tsx` או ב-CSS.
- Reset בסיסי (`box-sizing: border-box`, איפוס margin/padding).
- `body`: `background: var(--color-bg)`, `color: var(--color-text)`,
  `font-family: var(--font-family)`, `direction: rtl`.
- גישת **Mobile First**: סגנון בסיס למסך צר; Media Queries להרחבה ל-Desktop.
- שימוש ב-`clamp()` / Relative Units לגדלים מרכזיים (ARCHITECTURE §34).
- Touch targets נוחים ו-Focus State לרכיבי ניווט (Accessibility §55).

**אימות Slice:** כל המסכים RTL; רקע כהה; גופן Rubik נטען; פריסה תקינה במסך צר וגם רחב.

---

## 6. שלד לכל המסכים (Slice 5)

יצירת 6 קבצים ב-`src/pages/`. ב-M1 כולם **שלד סטטי** — טקסט/כותרות ומבנה בלבד,
ללא לוגיקה. תוכן מלא ועיצוב מדויק יגיעו ב-M5. מבנה כל מסך לפי `DESIGN.md`:

- **`HomePage.tsx`** — לוגו/שם "Space Shooter", כפתור גדול "התחל" (`Link` ל-`/game`).
- **`GamePage.tsx`** — placeholder לאזור המשחק (ללא Canvas עדיין) + כפתור "סיים משחק"
  (ב-M1 רק חוזר ל-`/`). הערה בקוד: Canvas ו-HUD מגיעים ב-M2/M3.
- **`StatisticsPage.tsx`** — כותרת "סטטיסטיקות" + שלד טבלה (עמודות: תאריך, ניקוד, שלב,
  תוצאה) עם הודעת "עדיין אין משחקים קודמים להצגה" כ-placeholder (ללא localStorage ב-M1).
- **`HowToPlayPage.tsx`** — כותרת + מקטעי הסבר (מטרה, איך משחקים, 3 גדלי אויבים, חיים,
  מעבר שלב, הפסד) כטקסט סטטי.
- **`AboutPage.tsx`** — לוגו/שם, "גרסה 1.0", טקסט קצר, קרדיט "מתכנת: אסף פינקלשטיין".
- **`GameOverPage.tsx`** — שלד: ניצחון/הפסד, ניקוד סופי, שלב שהושג, כפתור "משחק חדש"
  (ב-M1 מפנה ל-`/game`). הצגה סטטית בלבד.

**אימות Slice:** כל 6 המסכים מרונדרים עם המבנה הבסיסי הנכון.

---

## 7. Navigation בסיסי (Slice 6)

`src/components/navigation/` — רכיב `Navigation`:

- פריטי תפריט (ARCHITECTURE §38): **ראשי** (`/`), **סטטיסטיקות** (`/statistics`),
  **איך לשחק** (`/how-to-play`), **אודות** (`/about`).
- **Desktop:** שורת ניווט רגילה (Media Query).
- **Mobile:** Hamburger Menu שנפתח/נסגר (state מקומי, כפתור פתיחה + פאנל).
- קישורים ב-`NavLink` עם Active state; RTL; aria-labels לאייקונים.
- מקור אמת לפריטים: מערך ב-`src/types/` (למשל `navItems`) לשימוש חוזר.
- הערה: אייקון ה-Sound Toggle בפועל מגיע ב-M7 (Audio). ב-M1 אפשר להציג placeholder
  לא-פעיל או להשמיטו — **לא** לממש לוגיקת שמע.
- הערה: חסימת ניווט בזמן משחק = M5, לא כאן.

**אימות Slice:** התפריט עובד ב-Desktop וב-Mobile; כל קישור מנווט למסך הנכון.

---

## 8. השפה הגרפית הראשונית (Slice 7)

יישום ראשוני של השפה הגרפית מ-`DESIGN.md` ומה-Mockups/Style-Guide — **בסיסי**, לא
pixel-perfect (יישור מלא ל-Mockups הוא M5):

- **צבעים:** שימוש במשתני ה-CSS מ-§5.
- **טיפוגרפיה:** Rubik; כותרות Bold; גדלים לפי הסקאלה.
- **כפתורים:** רכיב כפתור משותף ב-`components/common/` עם וריאנטים:
  `primary` (טורקיז), `success` ("התחל" ירוק), `danger` ("סיים משחק" אדום/ורוד),
  פינות מעוגלות מאוד, Gradient/Glow עדין, Contrast גבוה, Touch target גדול.
- **רקעים:** רקע חלל כהה (`--color-bg`) לכלל האפליקציה; כוכבים אפשר לרמז ב-CSS
  (רקע סטטי) — הרקע העשיר/הסופי אינו חובה ב-M1.
- **Cards / Panels:** רקע `--color-bg-panel`, Border עדין כחול/סגול, פינות מעוגלות.
- **RTL:** כל רכיבי ה-UI מיושרים RTL.

> אין ליצור/להטמיע Assets גרפיים סופיים (לוגו PNG, ספרייטים, מוזיקה) ב-M1 —
> אלו שייכים ל-M7 (Asset Integration). ב-M1 טקסט/CSS/placeholders בלבד.

**אימות Slice:** המסכים נראים בהתאם לשפה הגרפית (צבעים, גופן, כפתורים, רקע כהה).

---

## 9. רשימת קבצים ליצירה/שינוי (סיכום)

**ליצור:**
- `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` (ע"י Vite + התאמות)
- `src/main.tsx`, `src/App.tsx`
- `src/styles/variables.css`, `src/styles/global.css`
- `src/pages/HomePage.tsx`, `GamePage.tsx`, `StatisticsPage.tsx`,
  `HowToPlayPage.tsx`, `AboutPage.tsx`, `GameOverPage.tsx`
- `src/components/navigation/Navigation.tsx` (+ CSS נלווה)
- `src/components/common/Button.tsx` (+ CSS נלווה)
- `src/types/navigation.ts` (פריטי ניווט / קבועי routes)
- `.gitkeep` בתיקיות: `components/common` (אם ריקה זמנית), `components/game-ui`,
  `game`, `services`, `hooks`, `assets/images`, `assets/audio`, `assets/icons`

**לשנות:**
- `CLAUDE.md` — למלא סעיף "פקודות" (`dev`/`build`/`test` בפועל) ותיאור קצר בסעיף
  "על הפרויקט" + Tech stack, לאחר שהפרויקט מוקם. (לשאול לפני commit — ראו §11.)
- `spec/MILESTONES.md` — לסמן משימות Milestone 1 כ-☑ תוך כדי העבודה.

---

## 10. Definition of Done ל-Milestone 1

מתוך `MILESTONES.md`, ה-Milestone הושלם כאשר:

- [ ] הפרויקט עולה (`npm run dev`) ו-`npm run build` עובר **ללא שגיאות**.
- [ ] TypeScript type-check עובר ללא errors (ARCHITECTURE §61).
- [ ] ניתן לנווט בין **כל** המסכים דרך ה-Navigation וה-URLים.
- [ ] כל 6 המסכים קיימים במבנה בסיסי.
- [ ] RTL פעיל בכל ה-UI.
- [ ] העיצוב הראשוני תואם לשפה הגרפית (צבעים, Rubik, כפתורים, רקע כהה).
- [ ] אין Console Errors בשימוש רגיל.
- [ ] Navigation עובד ב-Desktop (תפריט רגיל) וב-Mobile (Hamburger).

---

## 11. עצירות ונקודות אישור (לפי CLAUDE.md)

- **לא לבצע `git commit` ולא deploy** בלי אישור מפורש מהמפתח.
- אין צורך במפתחות/חשבונות ל-M1 — אם בכל זאת יתעורר צורך, **לעצור ולשאול**.
- בסיום Milestone 1 — **לעצור ולהמתין לבדיקת המפתח** לפני מעבר ל-Milestone 2.
- כל סתירה אמיתית בין מסמכים שאינה נפתרת בכלל התחום → **לשאול לפני החלטה**.
```