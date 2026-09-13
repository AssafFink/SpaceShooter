# QA Report — Milestone 9

> דוח זה מסכם את עבודת ה-QA, התיקונים והכיוונון שבוצעו ב-Milestone 9, לפי
> `spec/plans/milestone-9.md`. הוא **אינו** מחליף את ה-DoD ב-`spec/MILESTONES.md`
> (שם מסומנות התיבות), אלא מספק את הפירוט מאחוריהן ואת רשימת הבדיקות
> שנותרו למפתח בדפדפן/מכשיר אמיתי.

---

## 1. סיכום מנהלים

- 8 ממצאים אמיתיים אותרו בסקירת קוד ממוקדת ותוקנו כולם (F1–F8 למטה).
- נוספה סוויטת בדיקות אוטומטיות (**Vitest**, תלות dev חדשה יחידה) — **60/60
  עוברות**, מכסה את כל התרחישים ב-ARCHITECTURE §60.
- רמת הקושי בשלבים 8–10 רוככה מעט (עדיין השלבים הקשים ביותר, אך לא קיצוניים).
- `npm run build`, `npm test`, ו-`npm run lint` (oxlint) עוברים נקי; 0
  שגיאות/אזהרות TypeScript; 0 Console Errors לאורך כל תסריט הבדיקה.
- כל ~46 קבצי הקוד תורגמו לאנגלית בהערות/JSDoc (מחרוזות UI בעברית נשארו
  כמות שהן, כנדרש).
- Production Build אומת: Manifest, Service Worker ו-Deep Linking עובדים
  נכון תחת `vite preview`.
- **נותרו בדיקות שדורשות מכשיר/דפדפן אמיתי של המפתח** — ראו סעיף 6.

---

## 2. ממצאים שתוקנו (F1–F8)

| # | ממצא | תיקון | קבצים |
|---|------|-------|-------|
| F1 | הערות קוד בעברית ב-46 קבצים, בניגוד ל-CLAUDE.md | תרגום מלא לאנגלית; מחרוזות UI נשארו בעברית | ~46 קבצים תחת `src/`, `tools/` |
| F2 | `crypto.randomUUID()` נכשל ב-Non-Secure Context (למשל בדיקה מטלפון דרך `http://192.168.x.x`) → תוצאת Win/Loss לא נשמרת בשקט | `createResultId()` עם Fallback ל-`game-<timestamp>-<random>` בתוך try/catch | `src/services/storageService.ts` |
| F3 | סיבוב מכשיר (Orientation) באמצע שלב יכול להעלים אויבים בשקט או לגרום לאיבוד חיים לא הוגן (מיקום/כיוון לא מותאמים לגבולות החדשים) | Resize כעת: משנה מיקום יחסית לגבולות החדשים, מכוון (`retargetEnemy`) מחדש לתותח, ומוודא (`pushEnemyOutsideRadius`) שאף אויב לא נשאר בתוך רדיוס הפגיעה — Resize לעולם לא גורם לאיבוד חיים | `src/game/GameEngine.ts`, `src/game/Enemy.ts` |
| F4 | ה-Canvas יכול להישאר ריק (שחור) אחרי Resize כשהמשחק מוקפא (Dialog "סיים משחק" פתוח) | `resize()` מצייר פריים אחד מיידית בסיומו | `src/game/GameEngine.ts` |
| F5 | אצבע שנייה (Multi-touch) או כפתור עכבר לא-שמאלי יורים בטעות | `handlePointerDown` מתעלם מ-`!event.isPrimary` ומכפתורי עכבר שאינם השמאלי | `src/hooks/useGameEngine.ts` |
| F6 | רמת הקושי תלויה בגובה המסך — ב-Landscape בטלפון האויבים חוצים את המסך פי ~2.6 מהר יותר מאשר ב-Portrait, כי המהירות מוגדרת ב-px/s קבועים | `enemySpeedScale(height)` מנרמל את המהירות לגובה אזור המשחק (Reference height 640px, clamp 0.5–1.2), מיושם ב-Spawn וב-Resize | `src/game/gameConfig.ts`, `src/game/Enemy.ts`, `src/game/EnemySpawner.ts`, `src/game/GameEngine.ts` |
| F7 | מוזיקת הרקע ממשיכה לנגן כשהאפליקציה/הטאב ברקע (מסך נעול, מעבר אפליקציה) | `audioService.suspend()/resume()` על `AudioContext`, מופעל דרך `visibilitychange` | `src/services/audioService.ts`, `src/hooks/useAudio.ts` |
| F8 | גרסה ב-`package.json` (`0.0.0`) לא תואמת "גרסה 1.0" במסך אודות; `CLAUDE.md` § פקודות ריק; `.gitkeep` מיותר בתיקייה לא ריקה | `version: "1.0.0"`; פקודות מולאו; `.gitkeep` הוסר | `package.json`, `CLAUDE.md`, `src/services/.gitkeep` (הוסר) |

כל תיקון לוגי (F2–F7) מכוסה בבדיקת Vitest ייעודית שמוכיחה את התיקון
(נכשלת ללא התיקון, עוברת איתו).

---

## 3. בדיקות אוטומטיות (Vitest)

תלות dev חדשה יחידה: `vitest` (v5, תומך Vite 8). קובץ config נפרד
(`vitest.config.ts`) כדי לא לערב את VitePWA בהרצת בדיקות.

```bash
npm test
```

**תוצאה: 6 קבצי בדיקה, 60 בדיקות, כולן עוברות.**

| קובץ | מה נבדק |
|------|---------|
| `tests/collision.test.ts` | Swept Collision קליע↔אויב, פגיעה באויב הראשון במסלול, קליע פוגע באויב אחד בלבד, ירי לריק, Collision תותח↔אויב |
| `tests/enemy.test.ts` | HP/ניקוד לפי גודל (1/2/3), תנועה כמעט-ישרה ללא Homing, `retargetEnemy`, `pushEnemyOutsideRadius`, `enemySpeedScale` |
| `tests/spawner.test.ts` | טווח כמות אויבים, Spawn הדרגתי (לא הכל בבת אחת), מיקום X בתוך גבולות, נרמול מהירות לגובה (F6) |
| `tests/gameEngine.test.ts` | משחק חדש, חיסול→ניקוד, Hit Lock (כמה אויבים בו-זמנית→חיים−1 בלבד), Restart שלב שומר Score/Lives, הפסד ב-0 חיים, מעבר שלב→שלב הבא, ניצחון בשלב 10, `shoot()` מתעלם כשלא playing, **Resize**: שימור Score/Lives/Level, אין פגיעה חינם, Re-aim נכון, ניקוי קליעים |
| `tests/storageService.test.ts` | שמירת Win/Loss, סדר שמירה, JSON פגום/לא-מערך/רשומות פגומות→נופל בבטחה, storage שזורק→לא קורס, **F2**: שמירה עובדת גם כש-`crypto.randomUUID` זורק, ברירת מחדל/Persistence של Sound Muted |
| `tests/levels.test.ts` | 10 שלבים תקינים, min≤max בכל טווח, הסתברויות=1, קושי לא-יורד בין שלבים, תקרת קושי לילדים (≤1.8 פגיעות/שנייה בשלב 10, ≥6 שניות מסלול בכל שלב) |

---

## 4. כיוונון רמת קושי (F6 + §4 בתוכנית)

לאחר תיקון F6 (נרמול מהירות לגובה), שלבים 8–10 רוככו מעט כדי לשמור על יחס
פגיעות-לשנייה סביר גם בשלב 10:

| שלב | Spawn Interval לפני | Spawn Interval אחרי | Enemy Count לפני | Enemy Count אחרי |
|-----|---------------------|----------------------|-------------------|---------------------|
| 8 | 0.9–1.5s | 1.0–1.5s | 14–19 | 14–19 (ללא שינוי) |
| 9 | 0.8–1.4s | 0.95–1.45s | 16–21 | 15–20 |
| 10 | 0.7–1.3s | 0.9–1.4s | 18–24 | 17–22 |

תוצאה: דרישת הפגיעות-לשנייה בשלב 10 ירדה מ-**2.0** ל-**~1.74**, ונשמר יחס
עולה מונוטוני בין כל השלבים (נבדק אוטומטית ב-`levels.test.ts`).
שלבים 1–7 ללא שינוי.

**חשוב:** זהו כיוונון מבוסס-חישוב, לא Playtest אנושי. אם שלב מסוים מרגיש
קשה/קל מדי בפועל — הכיוונון הוא שינוי ערכים ב-`src/game/gameConfig.ts`
(מערך `LEVELS`) בלבד.

---

## 5. אימות בדפדפן (Preview)

בוצע דרך `npm run dev` (Browser pane):

- ✅ **Core Gameplay:** ירי, פגיעה, חיסול, אנימציית פיצוץ, עדכון Score/
  Enemies Remaining — כולם עובדים ונצפו חזותית.
- ✅ **End Game Flow:** "סיים משחק" → Dialog → "ביטול" ממשיך; "סיים משחק"
  (אישור) → חזרה למסך ראשי; Navigation חוזר לאחר יציאה מהמשחק.
- ✅ **Statistics:** משחק שהופסק ידנית (End Game) **לא** נשמר — מסך
  Statistics מציג "עדיין אין משחקים קודמים להצגה" גם אחרי משחק ואחרי Refresh
  (נבדק ישירות — התאמה ל-PRD §4.14, §ב מקרי-קצה).
- ✅ **How To Play, About:** תוכן תואם ל-PRD §4.16–4.17, ללא שגיאות.
- ✅ **Responsive:** 390×844 (Portrait) ו-844×390 (Landscape) — אין גלישה
  אופקית (`scrollWidth === clientWidth`) במסך הראשי ובמסך המשחק; HUD קומפקטי
  ב-Landscape ללא חיתוך.
- ✅ **0 Console Errors** לאורך כל התסריט (Home → Game → Dialog → Statistics
  → How To Play → About → חזרה).
- ✅ **Production Build (`vite preview`):** Deep Link ל-`/statistics` נטען
  ישירות ומרונדר נכון; `manifest.webmanifest` ו-`sw.js` נגישים ותקינים
  (`manifest.name === "Space Shooter"`, 3 אייקונים, `display: "standalone"`).
- ✅ **`?level=` Dev Hook לא דלף ל-Production:** נבדק ב-`dist/assets/*.js` —
  אין `import.meta.env.DEV`/קריאת `level=` מה-URL בקוד המהודר.

### מגבלת סביבה ידועה (זהה למ-M7/M8)
סביבת ה-Preview האוטומטית **משהה את `requestAnimationFrame`** כל אימות
הריצה שלה לא בחלון קדמי/גלוי (`document.hidden`). זו מגבלה של סביבת
הבדיקה האוטומטית, לא של הקוד — אומת ישירות (ניסיון `requestAnimationFrame`
בזמן שהחלון מוסתר לא הניב אף Frame תוך 45 שניות). בפועל, גם תוך המגבלה הזו
נצפתה משחקיות מלאה ותקינה (ירי, חיסול, מעבר שלבים) בזמן שהחלון היה קדמי.
כתוצאה מכך: **אימות חי של תזמונים (Orientation באמצע-אנימציה, מוזיקה
ברקע) בוצע בעיקר דרך Vitest** (§3), שאינו תלוי ב-rAF אמיתי; אימות התחושה
בפועל (חלון גלוי עם רמקולים) — לבדיקת המפתח, ראו סעיף 6.

---

## 6. Checklist לבדיקת המפתח (לא ניתן לאמת בסביבה האוטומטית)

| # | בדיקה | הוראות |
|---|-------|--------|
| [ ] | **אודיו בפועל** | לפתוח את המשחק בחלון דפדפן גלוי עם רמקולים; לוודא מוזיקת רקע, צליל ירי, פיצוצי אויב/תותח, Mute/Unmute |
| [ ] | **Orientation חי** | לשחק באמצע שלב ולסובב מכשיר/חלון בפועל; לוודא שהתחושה (לא רק המצב הלוגי) תקינה |
| [ ] | **מוזיקה נעצרת ברקע (F7)** | להפעיל מוזיקה, לעבור אפליקציה/לנעול מסך בטלפון, ולוודא שהיא נעצרת ומתחדשת בחזרה |
| [ ] | **Chrome Desktop / Edge Desktop** | זרימה מלאה מקצה לקצה |
| [ ] | **Chrome Mobile / Edge Mobile** | Touch, Portrait+Landscape, סיבוב פיזי |
| [ ] | **PWA Install** | ראו הוראות למטה — דורש Secure Context |
| [ ] | **Offline** | לאחר התקנה/טעינה ראשונה, מצב טיסה → פתיחת המשחק, התחלת משחק, מעבר מסכים, Statistics |
| [ ] | **סגירת Tab/PWA באמצע משחק** | פתיחה מחדש = מסך ראשי, ללא Resume, ללא שמירה בסטטיסטיקות |
| [ ] | **Playtest קושי** | לילד/מפתח בגיל היעד (6–12) — לוודא ששלבים 8–10 מרגישים מאתגרים אך לא בלתי אפשריים אחרי הכיוונון בסעיף 4 |

### איך לבדוק PWA/Offline בטלפון בלי Deploy
Service Worker דורש Secure Context (HTTPS או `localhost`) —
`http://192.168.x.x` **לא** יאפשר התקנה/SW. דרך ללא חשבון וללא Deploy:

1. לחבר את הטלפון (Android) למחשב ב-USB, עם Developer Options + USB
   Debugging מופעלים.
2. ב-Chrome Desktop: `chrome://inspect` → "Port forwarding" → להוסיף
   `4173 → localhost:4173`.
3. להריץ `npm run preview` (או `npm run build && npm run preview`) במחשב.
4. בטלפון, ב-Chrome: לפתוח `http://localhost:4173` — זהו Secure Context
   דרך ה-Port Forwarding, ו-SW/Install יעבדו.

---

## 7. Build ואיכות קוד — סיכום

```bash
npm run build   # tsc -b && vite build — עובר נקי
npm test        # vitest run — 60/60 עוברות
npm run lint    # oxlint — 0 אזהרות
```

- Bundle עיקרי: `index-*.js` ≈ 299KB (gzip ≈ 97KB), `index-*.css` ≈ 19KB
  (gzip ≈ 4.4KB). Precache של Service Worker: 47 קבצים, ~996KB — כולל כל
  ה-JS/CSS/HTML/תמונות/פונטים.
- אין `console.*`/`TODO`/`FIXME` בקוד.
- 4 Event Listeners בלבד באפליקציה כולה (`useGameEngine`: pointerdown;
  `useAudio`: pointerdown + visibilitychange (F7); `Modal`: keydown),
  כולם מנוקים ב-cleanup.
