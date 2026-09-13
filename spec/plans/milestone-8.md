# Milestone 8 – Responsive, Mobile & PWA — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 8** מתוך `spec/MILESTONES.md`.
> מטרה: להשלים התאמה מלאה למובייל (Portrait + Landscape), טיפול בשינוי
> Orientation בזמן משחק, אופטימיזציית Touch, והפיכת האפליקציה ל-**PWA
> מותקנת שעובדת Offline** (Web App Manifest + Service Worker + Cache).
>
> **לא** נכללים ב-Milestone זה (שמורים ל-M9 – QA & MVP Release):
> - QA מקיף וסבב בדיקות פורמלי, כיוונון רמת קושי, Final Visual Review,
>   Production build סופי. כאן נבצע רק אימות עבודה של הפיצ'רים של M8.
> - שינויים בחוקי משחק, ניקוד, חיים, שלבים או Collision — נעולים מ-M3/M4.
>
> **גבול נגיעה במנוע:** מינימלי. תשתית ה-Resize של המנוע כבר קיימת ועובדת
> (ראו §0). השינוי היחיד הצפוי במנוע הוא clamping של קליעים לגבולות אחרי
> Resize — תיקון קטן ומקומי. אין לשנות לוגיקת משחק אחרת.

---

## 0. הקשר ונקודת מוצא — מה כבר קיים (מצמצם משמעותית את העבודה)

Milestones 1–7 הושלמו. חלק ניכר מדרישות M8 כבר מסופק על ידי קוד קיים; חשוב
למפות זאת כדי לא לכפול עבודה:

**Resize / Orientation (כבר עובד ברובו):**
- `src/hooks/useGameEngine.ts` — יוצר `ResizeObserver` על ה-container של
  ה-Canvas וקורא ל-`engine.resize(width, height)` בכל שינוי גודל. זה עונה
  ישירות על ARCHITECTURE §36 ("אין להסתמך רק על Orientation Events; יש להגיב
  בפועל לשינוי Size"). סיבוב מכשיר משנה את גודל ה-container → יורה resize.
- `src/game/GameEngine.ts::resize()` — מטפל ב-`devicePixelRatio` (מוגבל ל-2),
  מעדכן `canvas.width/height` ואת ה-transform, מחשב מחדש `bounds`, ממקם מחדש
  את התותח (`cannon.setBounds`), מייצר מחדש כוכבים, ו-**clamp** לאויבים
  (`clampEnemyToBounds`). Score/Lives/Level הם שדות שאינם נגעים ב-resize →
  נשמרים אוטומטית (עונה ל-PRD §4.19 / ARCHITECTURE §35).
- `src/game/Cannon.ts::setBounds()` — התותח ממוקם יחסית ל-bounds (מרכז X,
  תחתית Y) → Reposition נכון בכל Orientation.

**Touch (כבר עובד ברובו):**
- `src/components/game-ui/GameCanvas.css` — כבר כולל `touch-action: none`,
  `user-select: none`, `-webkit-tap-highlight-color: transparent` (מונע
  Scroll/Zoom/Gestures/הדגשה על אזור המשחק — ARCHITECTURE §36, §55).
- Input דרך `pointerdown` (`useGameEngine.ts`) — אחיד ל-Mouse וגם ל-Touch,
  עם `event.preventDefault()`.

**Layout (בסיס Mobile-First קיים):**
- `index.html` — כבר כולל `viewport` עם `viewport-fit=cover`,
  `<meta name="theme-color" content="#0B1026">`, `lang="he" dir="rtl"`.
- `src/styles/global.css` — Mobile-First, `100dvh`, `prefers-reduced-motion`,
  Focus states. `variables.css` — `clamp()` לטיפוגרפיה, `--touch-target-min:
  44px`, breakpoint בשימוש: `768px`.
- `Navigation.tsx` — כבר יש Desktop nav + Hamburger למובייל.

**מה חסר לחלוטין (עיקר העבודה ב-M8):**
- **PWA — אין כלום.** אין Manifest, אין Service Worker, אין אייקוני PWA
  (רק `public/favicon.svg`), אין Offline. grep על הפרויקט: `NO PWA REFS`.
- **Landscape על מובייל** — לא נבדק/כוון. ב-Landscape נמוך, הפריסה האנכית
  של מסך המשחק (HUD למעלה + Canvas + כפתור "סיים משחק" למטה) עלולה להיות
  צפופה. צריך media queries ל-`orientation: landscape`.
- **מניעת Scroll/overscroll ברמת המסך** בזמן משחק (pull-to-refresh, גרירת
  גוף הדף) — מעבר לאזור ה-Canvas עצמו.

---

## 1. Slices 1–6 — Responsive, Orientation & Touch

### 1.1 Mobile-First Layout audit (Slice 1)
לעבור על כל 6 המסכים בגדלים 320/360/390/414 ולוודא שאין גלישה אופקית,
טקסט חתוך או כפתורים קטנים מ-44px. הבסיס קיים; צפויים תיקוני `padding`/`gap`
נקודתיים בלבד. **קבצים:** CSS של העמודים לפי הצורך; ללא שינוי מבנה.

### 1.2 Portrait Support (Slice 2)
זהו מצב ברירת המחדל שכבר עובד. לוודא במפורש בכל המסכים + מסך המשחק.
אין שינוי קוד צפוי מעבר לתיקוני §1.1.

### 1.3 Landscape Support (Slice 3) — עיקר עבודת ה-CSS
הבעיה: בגובה נמוך (Landscape בטלפון), `.game-page` מציג HUD + Canvas
(`min-height: 240px`) + כפתור בעמודה אנכית — צפוף.
**גישה (CSS בלבד, ללא JS):**
- `@media (orientation: landscape) and (max-height: 500px)` במסך המשחק:
  - להקטין `padding`/`gap` של `.game-page`.
  - להקטין את `GameHud` (font/padding קומפקטיים) — ראו `GameHud.css`.
  - להוריד/להתאים את `min-height: 240px` של `.game-canvas` כדי לא לדחוף
    את הכפתור מחוץ למסך; לתת ל-Canvas למלא את הגובה הזמין (`flex: 1`).
- לוודא שהמסכים שאינם משחק (`.page`) קריאים ב-Landscape — הם כבר scrollable,
  לכן סבירים; תיקונים נקודתיים בלבד.
- **קבצים:** `src/pages/GamePage.css`, `src/components/game-ui/GameHud.css`,
  `src/components/game-ui/GameCanvas.css`.

### 1.4 Orientation Change בזמן משחק (Slice 4)
התשתית קיימת (§0). מה שנותר:
1. **תיקון קטן במנוע:** ב-`GameEngine.resize()` להוסיף גם clamping/הסרה של
   **קליעים** שיצאו מהגבולות החדשים (כרגע רק אויבים עוברים
   `clampEnemyToBounds`). קליע מחוץ לגבולות אחרי סיבוב פשוט יוסר בפריים הבא
   דרך `isOutOfBounds`, אך עדיף לוודא שאין קליע "תקוע". **החלטה:** מספיק
   לתת לזרימת ה-`isOutOfBounds` הקיימת לטפל בכך; לא נדרש קוד ייעודי — נאמת
   ידנית. (PRD §4.19 מתיר "איפוס קצר של פריסת אובייקטים".)
2. לאמת ידנית: סיבוב באמצע שלב שומר Score/Lives/Level ואינו מסיים משחק.
3. לוודא ש-`Confirmation Dialog`/`Level Complete` שורדים resize (הם React
   overlays מעל ה-wrap — אמורים לשרוד; לאמת).
- **קבצים:** אימות בעיקר; שינוי קוד רק אם האימות יחשוף תקלה.

### 1.5 Touch Optimization (Slice 5)
הבסיס קיים (`touch-action: none` על ה-Canvas). להוסיף:
- מניעת overscroll/pull-to-refresh **ברמת מסך המשחק בלבד**: `overscroll-behavior:
  none` על `.game-page`, ולשקול נעילת גובה/`overflow: hidden` בזמן `/game`.
- לוודא ש-`GameHud`, כפתור "סיים משחק", ו-`SoundToggle` עומדים ב-44px מגע.
- **קבצים:** `GamePage.css`, אולי `global.css` (overscroll ברמת body מותנה).

### 1.6 Desktop Support (Slice 6)
כבר עובד (Mouse click דרך `pointerdown`, Desktop nav, layout רספונסיבי).
אימות בלבד ב-Chrome/Edge Desktop.

---

## 2. Slices 7–11 — PWA & Offline (עיקר העבודה החדשה)

### 2.1 החלטת מימוש (טכנית, בתחום ARCHITECTURE — §46, §47, §3)
ARCHITECTURE דורש Manifest + Service Worker + Cache אך אינו מחייב כלי מסוים;
§3 מורה לבחור בפתרון הפשוט ביותר ל-MVP. **הבחירה: `vite-plugin-pwa`**
(מבוסס Workbox), הסטנדרט למחסנית Vite:
- מייצר Service Worker אוטומטית עם **precache של כל תוצרי ה-build** (JS/CSS/
  HTML/תמונות/פונטים) → Offline מלא ללא ניהול ידני של רשימת קבצים.
- מזריק את ה-Manifest ותגי ה-`<link>`/meta הנדרשים.
- `registerType: 'autoUpdate'` — עדכון שקוף בגרסה חדשה.
- `navigateFallback: 'index.html'` (ברירת מחדל) — קריטי ל-React Router
  (`BrowserRouter`): נתיבים כמו `/statistics` נטענים Offline.
- **תלות חדשה אחת (devDependency): `vite-plugin-pwa`.** זו החלטת build
  סטנדרטית בתחום ARCHITECTURE; אין צורך בחשבון/מפתח. אלטרנטיבה (SW בכתב יד +
  `manifest.json` ידני ב-`public/`) אפשרית אך יותר קוד תחזוקה ופחות אמינה
  ל-precache — נדחית.

> נכסי האודיו מסונתזים ב-Web Audio API (M7) והתמונות מיובאות דרך Vite
> ונכנסות ל-bundle → כולם נכנסים ל-precache אוטומטית. אין תלות ב-Remote
> Assets (ARCHITECTURE §42, §47). זהו יתרון ישיר של החלטות M7.

### 2.2 Web App Manifest (Slice 7)
דרך `VitePWA({ manifest: {...} })`:
- `name: "Space Shooter"`, `short_name: "Space Shooter"` (ARCHITECTURE §46).
- `start_url: "/"`, `display: "standalone"`, `theme_color: "#0B1026"`,
  `background_color: "#0B1026"`, `dir: "rtl"`, `lang: "he"`,
  `orientation: "any"` (PRD תומך Portrait+Landscape; אין Orientation Lock —
  ARCHITECTURE §35).
- `icons`: 192×192, 512×512, ו-512 `maskable`.
- **קבצים:** `vite.config.ts`.

### 2.3 PWA Icons
אין אייקוני PNG כיום (רק `favicon.svg`). **החלטה:** לייצר אייקונים
(`192`, `512`, `512-maskable`, ו-`apple-touch-icon` 180) מתוך `public/favicon.svg`
הקיים (הנושא החללי כבר מתאים) — סקריפט קטן ב-`tools/` (בעקבות התקדים
`tools/extract-sprites.py`), פלט ל-`public/icons/`. פשוט, עקבי עם המותג,
וניתן להחלפה בקלות. **קבצים:** `tools/generate-pwa-icons.*`, `public/icons/*`.

### 2.4 Service Worker + Offline Assets (Slices 8–9)
- `VitePWA` עם `workbox.globPatterns: ['**/*.{js,css,html,svg,png,woff2}']`
  — precache של קוד, CSS, HTML, אייקונים, ספרייטים, ופונט Rubik המקומי
  (`@fontsource/rubik` נכנס ל-bundle). עונה ל-ARCHITECTURE §47.
- רישום ה-SW: `vite-plugin-pwa` מזריק אוטומטית (או `virtual:pwa-register`
  ב-`main.tsx` עם `autoUpdate`). **קבצים:** `vite.config.ts`, אולי `main.tsx`.

### 2.5 Offline Validation (Slice 10)
לאמת (build + preview, ואז DevTools → Network Offline / Application):
פתיחת המשחק Offline, התחלת משחק, מעבר בין מסכים, אודיו (מסונתז — עובד תמיד),
Statistics (localStorage — מקומי). ללא Runtime Dependency חיצוני.

### 2.6 PWA Installability (Slice 11)
לאמת ב-Chrome/Edge: Manifest תקין, SW פעיל, אפשרות התקנה (Install prompt/
תפריט הדפדפן). **ללא כפתור Install ייעודי בממשק** (PRD §4, ARCHITECTURE §46).
בדיקה דרך Lighthouse PWA / DevTools → Application → Manifest.

---

## 3. אימות (Verification)
לפי preview_tools: `npm run build` → `vite preview`, ואז בדיקה בדפדפן.
1. **TypeScript/build נקי** — `npm run build` עובר ללא שגיאות.
2. **Responsive** — emulate mobile 390×844 (Portrait) ו-844×390 (Landscape),
   וכן tablet/desktop; בדיקת כל המסכים + משחק.
3. **Orientation באמצע משחק** — סיבוב תוך כדי שלב; Score/Lives/Level נשמרים,
   המשחק ממשיך.
4. **PWA** — DevTools → Application: Manifest נטען, Icons תקינים, SW registered
   & activated. Network Offline → reload → האפליקציה עולה ומשחק מתחיל.
5. צילומי מסך של Portrait, Landscape ו-Manifest למפתח.

> הערה (מ-M7): אנימציית ה-Game Loop ואודיו דורשים חלון גלוי (rAF מושהה
> כשה-preview מוסתר). אימות ה-PWA/Manifest/SW/Offline אינו תלוי בכך וניתן
> לאימות מלא; אימות תחושת המשחק ב-Orientation — לבדיקת המפתח בחלון גלוי.

---

## 4. סדר עבודה מוצע (Build)
1. Landscape + Touch CSS (§1.3, §1.5) — סיכון נמוך, אפקט מיידי.
2. אימות Orientation במנוע (§1.4) — תיקון רק אם נדרש.
3. `vite-plugin-pwa` + Manifest (§2.1–§2.2).
4. יצירת אייקוני PWA (§2.3).
5. Workbox/Offline config + רישום SW (§2.4).
6. Build + אימות Offline ו-Installability (§2.5–§2.6, §3).
7. עדכון `spec/MILESTONES.md` — סימון משימות M8 כ-✅.

## 5. קבצים שצפויים להשתנות
- **חדשים:** `tools/generate-pwa-icons.*`, `public/icons/*` (PNG),
  `spec/plans/milestone-8.md` (קובץ זה).
- **שינוי:** `vite.config.ts` (PWA plugin), `package.json` (+`vite-plugin-pwa`),
  אולי `src/main.tsx` (רישום SW), `index.html` (אם נדרש meta נוסף),
  `src/pages/GamePage.css`, `src/components/game-ui/GameHud.css`,
  `src/components/game-ui/GameCanvas.css`, אולי `src/styles/global.css`.
- **שינוי מנוע (רק אם אימות ידרוש):** `src/game/GameEngine.ts` (clamp קליעים).

## 6. Definition of Done (מתוך MILESTONES.md — M8)
- [ ] המשחק עובד ב-Mobile Portrait וב-Mobile Landscape.
- [ ] Orientation יכול להשתנות באמצע משחק (Score/Lives/Level נשמרים).
- [ ] המשחק עובד ב-Chrome וב-Edge.
- [ ] האפליקציה ניתנת להתקנה כ-PWA.
- [ ] האפליקציה עובדת Offline.
- [ ] `npm run build` עובר ללא שגיאות TypeScript.
