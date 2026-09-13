# Milestone 7 – Audio & Visual Polish — תוכנית מפורטת

> תוכנית זו מכסה **אך ורק את Milestone 7** מתוך `spec/MILESTONES.md`.
> מטרה: להפוך את המשחק מ-Prototype למוצר מלא מבחינת **Audio** ו-**Visual
> Feedback** — מוזיקת רקע ואפקטים קוליים, אנימציות פיצוץ מלאות, משוב חזותי
> לפגיעה, שילוב Assets גרפיים, ו-Polish של המעברים והכפתורים.
>
> **החלטות מקור שנקבעו מול המפתח לפני התכנון (מחייבות):**
> 1. **אודיו** — מסונתז בקוד באמצעות **Web Audio API**. אין קבצי mp3/ogg
>    חיצוניים: כל אפקטי הקול ומוזיקת הרקע נוצרים בזמן ריצה. יתרון: אפס תלות
>    ב-Assets מרוחקים, מוכן ל-Offline (M8) מיידית, ללא בעיות זכויות יוצרים.
> 2. **גרפיקה** — הנכסים ייגזרו **ככל שניתן מתוך `spec/style-guide.png`**
>    (הדמויות, התותח, הפיצוצים, הרקע, הלוגו). מה שלא ניתן לגזור בצורה נקייה —
>    נשאר ב-Vector Art הקיים כ-Fallback.
>
> **לא** נכללים ב-Milestone זה:
> - Responsive מלא למובייל, טיפול ב-Orientation, Touch Optimization — **M8**.
> - Web App Manifest, Service Worker, Cache, Offline validation, PWA install — **M8**.
> - QA מקיף, כיוונון קושי, Production build — **M9**.
>
> **גבול:** מותר לגעת במנוע המשחק ב-M7 (זו אבן הדרך של ה-Feedback הוויזואלי
> והקולי), אך השינויים במנוע מצומצמים ומוגדרים: (א) ערוץ אירועים למנוע כדי
> שה-UI יפיק קול, (ב) `variant` לפיצוץ, (ג) hit-flash לאויב. אין לשנות חוקי
> משחק, ניקוד, חיים, שלבים או Collision — אלה נעולים מ-M3/M4.

---

## 0. הקשר ונקודת מוצא

מה שקיים היום (Milestones 1–6 הושלמו):

- **מנוע משחק** (`src/game/**`) — עצמאי, אינו מייבא React. `GameEngine` מתקשר
  ל-React רק דרך `setOnStatsChange(cb)` (ARCHITECTURE §54). הלולאה, התנועה,
  ה-Spawn, ה-Collision וחוקי המשחק — נעולים ועובדים.
- **ציור** (`src/game/Renderer.ts`) — כולו **Vector Art** ב-Canvas: רקע חלל +
  כוכבים, תותח (משולש + קנה עם Glow), אויבים (כיפה + רגליים + עיניים לפי גודל/צבע),
  פיצוצים (טבעת + גרעין + ניצוצות), קליעים (עיגול זוהר + שובל). כל פונקציות הציור
  טהורות — מקבלות פרמטרים בלבד, ללא State פנימי מעבר ל-`ctx`.
- **פיצוצים** (`src/game/Explosion.ts`, `types/game.ts::Explosion`) — ישות עם
  `x/y/maxRadius/elapsedSeconds/durationSeconds`. משמשת גם לחיסול אויב וגם לפיצוץ
  התותח. אין `variant`.
- **אויב** (`src/game/Enemy.ts`, `types/game.ts::Enemy`) — כולל `hitPoints`,
  `applyHit()`. אין שדה למשוב חזותי על פגיעה שאינה מחסלת.
- **Sound (UI + State + Persistence בלבד)**:
  - `src/context/SoundContext.tsx` — `SoundProvider` עם `muted` (מאותחל
    מ-`getSoundMuted()`), `toggle()` (שומר דרך `setSoundMuted()`). ההערה בקוד
    כבר מציינת מפורשות: **"Milestone 7 יוסיף Audio Service שמאזין ל-`muted`
    ומשתיק/מפעיל בפועל... הרכיבים הצורכים לא ישתנו"**. זו נקודת החיבור של M7.
  - `src/context/soundContextValue.ts` — `SoundContextValue = { muted, toggle }`.
    **לא ישתנה** — ה-API אל הרכיבים נשאר זהה.
  - `src/components/common/SoundToggle.tsx` — כפתור אייקון (אמוג'י 🔊/🔇),
    צורך `useSound()`. עובד ומעצב; ב-M5/M6 ללא קול בפועל.
  - `src/services/storageService.ts` — `getSoundMuted()/setSoundMuted()` קיימים.
- **מסך משחק** (`src/pages/GamePage.tsx`) + `src/hooks/useGameEngine.ts` —
  ה-Hook יוצר את ה-Engine, מאזין ל-Resize ול-`pointerdown` (Input), מפעיל
  `engine.shoot()`, ומנקה הכל ב-unmount. `pause()/resume()` חושפים `stop()/start()`.
- **`src/assets/{audio,images,icons}/`** — מכילים רק `.gitkeep`. **אין נכסים
  אמיתיים בפרויקט.** `public/` מכיל רק `favicon.svg`.
- **`src/App.tsx`** — נמצא בתוך `SoundProvider` (ראו `main.tsx`), ולכן יכול
  לצרוך את `useSound()`. זו הנקודה הטבעית לאתחל את שכבת האודיו פעם אחת לכל
  האפליקציה (מוזיקת רקע חוצת-מסכים, ARCHITECTURE §31).

מקורות spec רלוונטיים ל-M7:
- **PRD**: §4.18 (מוזיקה ואפקטים), §UX (משוב חזותי/קולי מיידי), §4.6/§4.13
  (פיצוצים), §5 (Assets מקומיים ל-Offline).
- **ARCHITECTURE**: §30 (Audio Architecture — Service מרכזי), §31 (Background
  Music + Autoplay), §32–33 (Sound Settings + Persistence — כבר קיים), §42
  (Assets), §43 (Enemy Visuals), §44 (Background), §45 (Explosion Animation),
  §51 (הפרדה React↔Engine — לא לשבור), §54 (אין Re-render לכל Frame).
- **DESIGN**: Style Guide (מקור הנכסים לגזירה) — פלטת צבעים, אויבים בסגנון
  Pixel Art, תותח לייזר, קליע, ארבעה פיצוצים, רקע חלל, לוגו, אייקונים.

**אין צורך בשום חשבון, סיסמה, מפתח API או קובץ חיצוני** — האודיו מסונתז בקוד
והגרפיקה נגזרת מ-`style-guide.png` שכבר קיים בריפו.

---

## 1. החלטות טכניות ל-Milestone זה

### 1.1 אודיו — Web Audio API, Service יחיד

- קובץ חדש `src/services/audioService.ts` — **Singleton framework-agnostic**
  (כמו `storageService`), מרכז את כל האודיו (ARCHITECTURE §30). אף Component
  לא ניגש ל-Web Audio ישירות.
- מבנה גרפי: `AudioContext` → `masterGain` → `destination`. השתקה = הבאת
  `masterGain.gain` ל-0; הפעלה = החזרה ל-`GAME_CONFIG.audio.masterVolume`.
  שני תת-ערוצים: `musicGain` ו-`sfxGain` תחת `masterGain` (מאפשר איזון עוצמות,
  **אין** Volume Slider ואין שליטה נפרדת ב-UI — ARCHITECTURE §32).
- **אפקטי קול מסונתזים** (ללא קבצים):
  - `playLaser()` — Oscillator (square/saw) עם Sweep יורד (~800→200Hz) ו-decay
    מהיר (~0.12s). קליל ולא צורם — משחק לילדים.
  - `playEnemyExplosion(size)` — פרץ White Noise (BufferSource) דרך Lowpass +
    envelope יורד. משך/עוצמה גדלים מעט לפי גודל האויב.
  - `playCannonExplosion()` — פרץ רועש גדול יותר + סינוס נמוך (thump) לתחושת
    פיצוץ התותח (~0.5–0.6s).
  - כל SFX יוצר צמתים חדשים בכל קריאה ומנתק אותם ב-`onended` (אין דליפת צמתים).
- **מוזיקת רקע מסונתזת** (`startMusic()/stopMusic()`) — לולאה דרמטית קלה:
  בס + ארפג'יו בסולם מינורי, מתוזמנים על ציר הזמן של ה-`AudioContext` ב-Scheduler
  עם Lookahead (`setInterval` קצר שרק **מתזמן** צמתים עתידיים — זה מותר;
  ARCHITECTURE §7 אוסר `setInterval` כלולאת המשחק הראשית, לא כ-scheduler אודיו).
  הלולאה חיה ב-Service, לכן **מעברי Route ב-React לא מפעילים אותה מחדש** (§31).
- **Browser Autoplay** (ARCHITECTURE §31): `AudioContext` נוצר במצב `suspended`.
  `unlock()` קורא ל-`ctx.resume()` **רק** בעקבות אינטראקציית משתמש ראשונה. אם
  המשתמש כבר מושתק — לא מנגנים, אך עדיין מבצעים `unlock` כדי שהחזרה מהשתקה תעבוד.
- **ניהול מצב חסר/כשל**: אם `AudioContext` לא זמין (דפדפן חוסם) — כל
  הפונקציות no-op בשקט, בדיוק כמו ה-try/catch ב-`storageService`. אין Crash.

### 1.2 חיבור ההשתקה — דרך `useAudio`, בלי לשנות את ה-Context API

- קובץ חדש `src/hooks/useAudio.ts` — Hook שמורכב **פעם אחת** ב-`App.tsx`
  (בתוך `SoundProvider`). אחריותו:
  1. אתחול חד-פעמי של `audioService` (idempotent, בטוח ל-StrictMode).
  2. רישום מאזין גלובלי חד-פעמי (`pointerdown`) שמבצע `audioService.unlock()`
     ומתחיל את מוזיקת הרקע (אם לא מושתק). מוסר את עצמו אחרי ההפעלה הראשונה.
  3. `useEffect([muted])` שקורא ל-`audioService.setMuted(muted)` — כך שהמצב
     היחיד (`SoundContext`) הוא מקור האמת, וה-Service רק "מבצע" אותו.
- **`SoundContext`, `soundContextValue`, `SoundToggle`, `GameHud`, `Navigation`
  לא משתנים** — בדיוק כפי שההערה ב-`SoundContext.tsx` הבטיחה. זה שומר על
  ההפרדה: ה-UI ממשיך לדבר עם ה-Context בלבד.

### 1.3 ערוץ אירועי-משחק מהמנוע ל-UI (לצורך SFX) — בלי לשבור §51

הבעיה: אירועי הקול (ירי, חיסול אויב, פיצוץ תותח) נולדים **בתוך** `GameEngine`,
אך המנוע אסור שיהיה תלוי ב-React או ב-`audioService` (ARCHITECTURE §51 — הפרדה).

הפתרון (אנלוגי ל-`setOnStatsChange` הקיים):
- להוסיף ל-`GameEngine` **ערוץ אירועים דק**: `setOnGameEvent(cb)` + טיפוס
  `GameEvent`. המנוע פולט אירוע ברגעי המפתח; הוא **לא** יודע מה עושים איתו.
- `useGameEngine` נרשם ל-`onGameEvent` וממפה כל אירוע לקריאת `audioService`.
  כך המנוע נשאר טהור, וה-Wiring לאודיו יושב בשכבת ה-React/Hook (כמו שכבר קורה
  עם `setStats`).

```ts
// types/game.ts (הרחבה)
export type GameEvent =
  | { type: 'shoot' }
  | { type: 'enemy-destroyed'; size: EnemySize }
  | { type: 'cannon-explosion' };
```

- נקודות הפליטה ב-`GameEngine`:
  - `shoot()` — **רק** כשנוצר קליע בפועל (אחרי בדיקות ה-guard) → `{type:'shoot'}`.
  - בלולאת ההיטים, כש-`isDestroyed(enemy)` → `{type:'enemy-destroyed', size}`.
  - `enterPlayerHit()` → `{type:'cannon-explosion'}`.
- אין אירוע קול לפגיעה שאינה מחסלת (ה-spec דורש רק 3 אפקטים) — שם יש **משוב
  חזותי** בלבד (ראו 1.5).

### 1.4 גרפיקה — גזירת Sprites מ-`style-guide.png` + טעינה ל-Canvas

- **גזירה חד-פעמית** דרך סקריפט build קטן (`tools/extract-sprites.mjs` או `.py`,
  מתועד ב-`tools/README.md`): לחתוך אזורים מ-`spec/style-guide.png`, להפוך את
  רקע הפאנל הכהה (סביב `#1A1F3D`/`#0B1026`) לשקוף (color-key), לחתוך שוליים
  (trim), ולשמור כ-PNG ב-`src/assets/images/`. הסקריפט מריצים פעם אחת; ה-PNG-ים
  הם התוצר המחייב שנשמר בריפו.
  - כלי מועדף: **Python Pillow** אם זמין; אחרת `sharp` כ-devDependency; אחרת
    `jimp`. הזמינות תיבדק בזמן הבנייה (זו החלטת implementation, לא spec).
  - קואורדינטות החיתוך המדויקות ייקבעו בבנייה מתוך פריסת ה-Style Guide (ניתן
    לזום/לסרוק bounding boxes של אזורים לא-רקע בתוך כל פאנל). אין לקבע כאן מספרי
    פיקסלים — הם ייגזרו מהתמונה עצמה.
- **מה נגזר** (לפי מה שנראה בבירור ב-Style Guide):
  | Sprite | מקור בתמונה | שימוש |
  |---|---|---|
  | `enemy-small.png` (ירוק) | פאנל "דמויות אויבים", 1 פגיעה | אויב small |
  | `enemy-medium.png` (ורוד) | שם, 2 פגיעות | אויב medium |
  | `enemy-large.png` (צהוב) | שם, 3 פגיעות | אויב large |
  | `cannon.png` | פאנל "תותח הלייזר" — הפוזה **הקדמית** (פונה מעלה) | התותח (מסובב בקוד) |
  | `explosion-small.png` | פאנל "קליע ואנימציות" — פיצוץ אויב קטן | פיצוץ small |
  | `explosion-medium.png` | שם — פיצוץ אויב בינוני | פיצוץ medium |
  | `explosion-large.png` | שם — פיצוץ אויב גדול | פיצוץ large |
  | `explosion-cannon.png` | שם — פיצוץ תותח (סגול) | פיצוץ התותח |
  | `laser.png` | שם — קליע לייזר | קליע |
  | `background.png` | פאנל "רקע המשחק" (חלל + כוכבי לכת) | רקע ה-Canvas |
  | `logo.png` (אופציונלי) | לוגו SPACE SHOOTER (פינה שמאל-עליון) | Home/About |
- **מה שנשאר Vector (Fallback / לא נגזר נקי):** אם החיתוך של רכיב מסוים יוצא
  מלוכלך (למשל הלוגו על רקע כוכבים, או התותח עם קרן לייזר מובנית) — משאירים את
  הציור הווקטורי הקיים. ה-Renderer יצייר Sprite **רק אם** נטען בהצלחה, אחרת
  נופל חזרה לפונקציה הווקטורית הקיימת (ראו 1.6). כך אין רגרסיה חזותית גם אם
  גזירה כלשהי לא מצליחה.
- **טעינה**: קובץ חדש `src/game/sprites.ts` — מייבא את ה-PNG-ים כ-URL (Vite
  `import url from '...png'`), יוצר `Image` לכל אחד, וחושף מפה + דגל `ready`
  לכל sprite. ה-Renderer בודק `img.complete && img.naturalWidth > 0` לפני שימוש.
  ב-M8 (PWA) הנכסים ה-hashed ייכנסו ל-Cache — לא נושא של M7.

### 1.5 משוב חזותי לפגיעה שאינה מחסלת (ARCHITECTURE §UX, MILESTONES slice 9)

- להוסיף ל-`Enemy` שדה `hitFlashSeconds: number`. `applyHit()` מציב אותו ל-
  `GAME_CONFIG.enemy.hitFlashDurationSeconds` בכל פגיעה שאינה מחסלת;
  `updateEnemy()` מוריד אותו ב-`deltaSeconds` עד 0.
- ה-Renderer, כשמצייר אויב עם `hitFlashSeconds > 0`, מוסיף הבזק לבן קצר (overlay
  לבן ב-`globalAlpha` יורד, או `globalCompositeOperation='lighter'`) ו/או "רעד"
  זעיר בקנה מידה. עובד גם על Sprite וגם על Vector.

### 1.6 עקרון ה-Renderer: Sprite-first, Vector-fallback

- כל פונקציית ציור קיימת (`drawCannon`, `drawEnemies`, `drawExplosions`,
  `drawProjectiles`, `drawBackground`) תנסה קודם `ctx.drawImage(sprite, ...)`
  אם ה-sprite מוכן, אחרת תריץ את הקוד הווקטורי הקיים **ללא שינוי לוגי**.
  זה שומר על אפס-רגרסיה ומאפשר ל-M7 להתקדם גם לפני שכל הנכסים נגזרו.
- `drawExplosions` יבחר sprite לפי `explosion.variant` החדש (ראו 1.7),
  ויאנפש single-still ע"י scale (progress) + fade (alpha) — כי ה-Style Guide
  נותן **תמונת פיצוץ בודדת** לכל סוג, לא Sprite Sheet (ARCHITECTURE §45 מתיר
  Sequence *או* single — נשתמש ב-scale/fade של סטיל בודד).

### 1.7 `Explosion.variant`

```ts
// types/game.ts (הרחבה)
export type ExplosionVariant = 'small' | 'medium' | 'large' | 'cannon';
export interface Explosion { /* קיים */ variant: ExplosionVariant; }
```
- `createExplosion(id, enemy)` יגדיר `variant = enemy.size`.
- `createExplosionAt(...)` (תותח) יקבל `variant` (יועבר `'cannon'`).
- מיפוי `variant → sprite` ב-Renderer.

---

## 2. קבצים — חדשים ומשתנים

**חדשים:**
- `src/services/audioService.ts` — Web Audio Service (SFX + music + mute + unlock).
- `src/hooks/useAudio.ts` — אתחול + unlock-on-first-interaction + סנכרון `muted`.
- `src/game/sprites.ts` — טעינת ה-Sprites (Image) וחשיפת מוכנוּת.
- `src/assets/images/*.png` — הנכסים הגזורים (טבלה ב-1.4).
- `tools/extract-sprites.*` + `tools/README.md` — סקריפט הגזירה החד-פעמי (מתועד).

**משתנים (מנוע — מצומצם ומוגדר):**
- `src/types/game.ts` — `GameEvent`, `ExplosionVariant`, `Explosion.variant`,
  `Enemy.hitFlashSeconds`.
- `src/game/GameEngine.ts` — `setOnGameEvent`; פליטת אירועים ב-`shoot`/חיסול/
  `enterPlayerHit`; העברת `variant` ליצירת פיצוצים.
- `src/game/Enemy.ts` — `hitFlashSeconds` ב-`createEnemy`, עדכון ב-`applyHit`/
  `updateEnemy`.
- `src/game/Explosion.ts` — `variant` בשתי פונקציות היצירה.
- `src/game/Renderer.ts` — Sprite-first לכל הציורים + hit-flash + בחירת פיצוץ
  לפי variant; טעינת רקע כתמונה.
- `src/game/gameConfig.ts` — בלוק `audio`, `explosionVariants` (גדלי sprite),
  `enemy.hitFlashDurationSeconds`, ואולי התאמת צבעי fallback לאויבים לצבעי
  ה-Style Guide (ירוק/ורוד/צהוב).

**משתנים (React/CSS — Polish):**
- `src/hooks/useGameEngine.ts` — הרשמה ל-`onGameEvent` → `audioService`.
- `src/App.tsx` — קריאה ל-`useAudio()` פעם אחת.
- `src/components/game-ui/LevelCompleteMessage.css` — כניסת "שלב X הושלם".
- `src/pages/GameOverPage.css` — כניסת מסך הסיום (Win/Loss).
- `src/components/common/Modal.css` — כניסת Dialog (fade+scale).
- `src/components/common/Button.css` — Polish (hover/active/glow עדין).
- `src/styles/global.css` — keyframes משותפים (fade-in, pop-in) + הפחתה תחת
  `prefers-reduced-motion`.
- `src/pages/HomePage.tsx` / `AboutPage.tsx` — שימוש בלוגו הגזור (אם נגזר נקי;
  אחרת נשארים על ה-Wordmark הקיים).

**לא נוגעים:** `soundContextValue.ts`, `SoundContext.tsx`, `SoundToggle.tsx`,
`GameHud.tsx`, `Navigation.tsx`, `storageService.ts`, `GameLoop.ts`,
`CollisionManager.ts`, `EnemySpawner.ts`, `LevelManager.ts`, חוקי המשחק.

---

## 3. תוכנית לפי Slices (מיפוי ל-MILESTONES.md)

1. **Audio Service** — יצירת `audioService.ts`: `AudioContext`, `masterGain`,
   `musicGain`, `sfxGain`, `unlock()`, `setMuted()`, no-op בטוח כשאין אודיו.
2. **Background Music** — `startMusic()/stopMusic()` עם Scheduler ולולאה
   מסונתזת; חיה ב-Service (לא מתאפסת ב-Route change).
3. **טיפול ב-Autoplay** — `unlock()` דרך מאזין `pointerdown` חד-פעמי ב-`useAudio`.
4. **Laser Sound** — `playLaser()`, נקרא מאירוע `{type:'shoot'}`.
5. **Enemy Explosion Sound** — `playEnemyExplosion(size)`, מאירוע
   `{type:'enemy-destroyed'}`.
6. **Cannon Explosion Sound** — `playCannonExplosion()`, מאירוע
   `{type:'cannon-explosion'}`.
7. **Sound Toggle** — `useAudio` מסנכרן `muted`→`audioService.setMuted`; אייקון
   ה-UI כבר קיים ומחובר ל-Context. השתקה משתיקה מוזיקה+אפקטים יחד (§32).
8. **Explosion Animation** — Sprite לכל `variant` (small/medium/large/cannon)
   עם scale+fade; Vector כ-fallback.
9. **Visual Feedback לפגיעה** — `hitFlashSeconds` על האויב + הבזק ב-Renderer.
10. **Asset Integration** — גזירת Sprites מ-`style-guide.png`, `sprites.ts`,
    Sprite-first ב-Renderer (תותח/אויבים/רקע/לייזר/פיצוצים), לוגו במסכים.
11. **Polish של מעברים** — CSS keyframes ל-Level Complete, Game Over, Dialogs,
    Buttons; כיבוד `prefers-reduced-motion`.

**סדר בנייה מומלץ:** 1→7 (כל האודיו כשכבה עצמאית, קל לבדיקה) → 8/9 (מנוע: variant
+ hit-flash) → 10 (גזירה + Sprite integration) → 11 (CSS Polish). כך כל שלב
נבדק בפני עצמו, וה-Vector-fallback מבטיח שהמשחק עובד גם לפני שהנכסים נגזרו.

---

## 4. פירוט `audioService.ts` (חתימות)

```ts
// framework-agnostic singleton — אף Component לא ניגש ל-Web Audio ישירות (§30)
export const audioService = {
  unlock(): void;                       // ctx.resume() אחרי אינטראקציה ראשונה
  setMuted(muted: boolean): void;       // masterGain → 0 / masterVolume
  startMusic(): void;                   // idempotent; לא מפעיל מחדש אם כבר רץ
  stopMusic(): void;
  playLaser(): void;
  playEnemyExplosion(size: EnemySize): void;
  playCannonExplosion(): void;
};
```
עקרונות: יצירת `AudioContext` עצלה (בקריאה הראשונה); כל SFX מנתק צמתים ב-`onended`;
כל הפונקציות עטופות ב-try/catch ל-no-op בטוח; `masterVolume`/משכים/תדרים —
מ-`GAME_CONFIG.audio` (אין Magic Numbers, ARCHITECTURE §62).

---

## 5. בדיקות ואימות (verification) — לפני עצירה למפתח

הרצה מקומית (`npm run dev`) ואימות דרך ה-Browser preview:
- **אודיו**: ירי → צליל לייזר; חיסול אויב → פיצוץ; אויב פוגע בתותח → פיצוץ תותח;
  מוזיקת רקע מתחילה אחרי הלחיצה הראשונה וממשיכה במעבר בין מסכים (לא מתאפסת).
- **Mute**: לחיצה על אייקון הקול משתיקה מוזיקה+אפקטים יחד; שחרור מחזיר; המצב
  שורד Refresh (persistence מ-M6 עדיין עובד).
- **ויזואל**: אויבים/תותח/רקע/קליע/פיצוצים מוצגים כ-Sprites גזורים; פגיעה לא-
  מחסלת מפיקה הבזק; מעברי Level Complete / Game Over / Dialog חלקים.
- **Fallback**: הסתרה זמנית של sprite אחד מוודאת שהציור הווקטורי חוזר בלי שגיאה.
- **תקינות** (ARCHITECTURE §61): אין Console errors; אין דליפת צמתי אודיו או
  Event listeners; המוזיקה נעצרת/משתחררת נכון; TypeScript עובר ללא שגיאות
  (`tsc`/`npm run build`); בדיקת נראות מול `style-guide.png` ו-`mockups.png`.
- אימות ראשוני לרספונסיביות בסיסית נשמר; **התאמת מובייל/Orientation מלאה — M8**.

לאחר האימות: לסמן את משימות M7 ב-`spec/MILESTONES.md` (כולל ה-Definition of
Done של M7), לעצור, ולמסור סיכום קצר. **לא לבצע commit** ללא אישור.

---

## 6. סיכונים ו-Fallbacks

- **גזירה לא נקייה מ-Style Guide** → עקרון ה-Sprite-first/Vector-fallback (1.6)
  מבטיח שהמשחק תמיד נראה תקין; רכיב שלא נגזר יפה נשאר Vector.
- **מוזיקה מסונתזת "דרמטית"** → מוגבל מטבעו; המטרה היא לולאה נעימה ולא צורמת
  לילדים. אם התוצאה חלשה — זה מקום לגיטימי לקבצי mp3 אמיתיים בעתיד, בלי שינוי
  ארכיטקטוני (ה-Service כבר מרכז הכל).
- **Autoplay policy** → `unlock()` רק אחרי אינטראקציה; ללא אינטראקציה אין קול
  (התנהגות תקינה, לא באג).
- **StrictMode (dev, mount כפול)** → אתחול ה-Service idempotent, וה-cleanup
  ב-`useAudio`/`useGameEngine` מסיר מאזינים ועוצר מוזיקה נכון.

---

## 7. מה מחוץ ל-M7 (לתיעוד, לא לביצוע)

- **M8**: Responsive מלא, Portrait/Landscape, Orientation resize, Touch
  optimization, Manifest, Service Worker, Cache, Offline, PWA install.
- **M9**: QA מלא, כיוונון קושי לגילאי 6–12, Production build.

> תזכורת: המנוע פולט אירועים אך אינו יודע על אודיו; ה-UI לא ניגש ל-Web Audio
> ישירות; ה-`SoundContext` נשאר מקור האמת היחיד למצב ההשתקה. כל שלושת הכללים
> האלה חייבים להישמר גם ב-M8/M9.
