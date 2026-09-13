# Space Shooter – Milestones & Slices

מסמך זה מפרק את פיתוח המשחק **Space Shooter** ל־Milestones ול־Slices קטנים, כך שניתן יהיה לעבוד בצורה הדרגתית וברורה מול Claude Code.

כל Slice צריך להסתיים בתוצאה שניתן לבדוק בפועל לפני שממשיכים ל־Slice הבא.

---
## כלל חשוב — אישור בין Milestones

אחרי סיום כל Milestone, Claude עוצר וממתין. אני (המפתח) בודק שה-Milestone עובד, ורק לאחר שאני מאשר במפורש — Claude ממשיך ל-Milestone הבא. אין להתחיל Milestone חדש לפני שאני מאשר.

## Milestone 1 – Project Foundation ✅

מטרת ה־Milestone: להקים את בסיס הפרויקט, מבנה האפליקציה והמסכים הראשוניים.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-1.md`.

### Slices

1. **יצירת הפרויקט** ✅
   - יצירת פרויקט באמצעות `Vite`.
   - שימוש ב־`React` ו־`TypeScript`.
   - הגדרת Scripts בסיסיים עבור Development ו־Build.

2. **יצירת מבנה התיקיות** ✅
   - יצירת תיקיות עבור:
     - `pages`
     - `components`
     - `game`
     - `services`
     - `hooks`
     - `types`
     - `assets`
     - `styles`

3. **הגדרת Routing** ✅
   - יצירת Routes עבור:
     - `/`
     - `/game`
     - `/statistics`
     - `/how-to-play`
     - `/about`
     - `/game-over`

4. **הגדרת RTL ו־Global Styles** ✅
   - הגדרת `dir="rtl"`.
   - יצירת `global.css`.
   - הגדרת Mobile First בסיסית.
   - יצירת משתני עיצוב מרכזיים.

5. **יצירת שלד לכל המסכים** ✅
   - `HomePage`
   - `GamePage`
   - `StatisticsPage`
   - `HowToPlayPage`
   - `AboutPage`
   - `GameOverPage`

6. **יצירת Navigation בסיסי** ✅
   - תפריט רגיל עבור Desktop.
   - Hamburger Menu עבור Mobile.
   - קישורים למסכים המתאימים.

7. **הטמעת השפה הגרפית הראשונית** ✅
   - צבעים.
   - טיפוגרפיה.
   - כפתורים.
   - רקעים.
   - שימוש ב־Style Guide וב־Mockups.

### Definition of Done

- [x] הפרויקט עולה ללא שגיאות.
- [x] ניתן לנווט בין כל המסכים.
- [x] כל המסכים קיימים במבנה בסיסי.
- [x] RTL פעיל.
- [x] העיצוב הראשוני תואם לשפה הגרפית שהוגדרה.

---

## Milestone 2 – Core Game Prototype ✅

מטרת ה־Milestone: ליצור Prototype עובד של אזור המשחק, התותח והירי.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-2.md`.

### Slices

1. **יצירת Canvas** ✅
   - הוספת `HTML5 Canvas` למסך המשחק.
   - התאמת ה־Canvas לגודל האזור הזמין.

2. **תמיכה ב־devicePixelRatio** ✅
   - התאמת הרזולוציה הפנימית של ה־Canvas למסכים בעלי צפיפות גבוהה.

3. **יצירת Game Loop** ✅
   - שימוש ב־`requestAnimationFrame`.
   - חישוב `Delta Time`.

4. **ציור רקע המשחק** ✅
   - רקע חלל אפל.
   - כוכבים סטטיים.

5. **יצירת Cannon** ✅
   - הצבת התותח בתחתית המסך.
   - שמירת מיקום קבוע.

6. **סיבוב Cannon לכיוון הלחיצה** ✅
   - חישוב זווית באמצעות `Math.atan2()`.
   - תמיכה ב־Mouse וב־Touch.

7. **יצירת Projectile** ✅
   - יצירת קליע לייזר אחד לכל לחיצה.
   - חישוב Direction Vector.

8. **תנועת Projectile** ✅
   - תנועה מהתותח אל היעד.
   - הסרה כאשר הקליע יוצא מגבולות המשחק.

9. **Cleanup בסיסי** ✅
   - ביטול Game Loop בעת יציאה מהמסך.
   - הסרת Event Listeners.

### Definition of Done

- [x] מסך המשחק מציג Canvas תקין.
- [x] התותח מופיע בתחתית המסך.
- [x] לחיצה או נגיעה מסובבת את התותח.
- [x] כל לחיצה יוצרת קליע אחד.
- [x] הקליע נע לכיוון נקודת הלחיצה.

---

## Milestone 3 – Enemies & Combat ✅

מטרת ה־Milestone: להוסיף אויבים, פגיעות, Collision Detection וניקוד.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-3.md`.

### Slices

1. **יצירת Enemy Model** ✅
   - הגדרת Enemy Type.
   - מיקום.
   - מהירות.
   - גודל.
   - Hit Points.
   - Score Value.

2. **יצירת שלושת סוגי האויבים** ✅
   - קטן: פגיעה אחת, נקודה אחת.
   - בינוני: שתי פגיעות, שתי נקודות.
   - גדול: שלוש פגיעות, שלוש נקודות.

3. **Enemy Spawner בסיסי** ✅
   - יצירת אויבים בהדרגה.
   - Spawn בחלק העליון של המסך.
   - מיקום X אקראי.

4. **תנועת אויבים** ✅
   - תנועה בקו כמעט ישר לכיוון התותח.
   - Random Variation קטן במהירות ובמסלול.

5. **Projectile–Enemy Collision** ✅
   - זיהוי פגיעה.
   - הקליע נעלם לאחר פגיעה ראשונה.

6. **מערכת Hit Points** ✅
   - הורדת Hit Point בכל פגיעה.
   - אויב ממשיך לנוע אם לא חוסל.

7. **חיסול אויב** ✅
   - הסרת Enemy לאחר שהגיע ל־0 Hit Points.
   - הפעלת אנימציית פיצוץ.

8. **מערכת ניקוד** ✅
   - עדכון Score בהתאם לגודל האויב.

9. **HUD ראשוני** ✅
   - הצגת Score.
   - הצגת מספר אויבים שנותרו.

### Definition of Done

- [x] אויבים מופיעים ונעים לכיוון התותח.
- [x] שלושת סוגי האויבים עובדים.
- [x] פגיעות מזוהות נכון.
- [x] קליע נעלם לאחר פגיעה.
- [x] אויבים מתחסלים בהתאם למספר הפגיעות שלהם.
- [x] הניקוד מתעדכן נכון.

---

## Milestone 4 – Lives, Levels & Game Rules ✅

מטרת ה־Milestone: להשלים את חוקי המשחק המרכזיים, החיים, השלבים, Win ו־Loss.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-4.md`.

### Slices

1. **Enemy–Cannon Collision** ✅
   - זיהוי מגע בין אויב לתותח.

2. **מערכת חיים** ✅
   - התחלת משחק עם 3 חיים.
   - הורדת חיים אחד בפגיעה.

3. **Hit Lock** ✅
   - מניעת איבוד יותר מחיים אחד כאשר כמה אויבים פוגעים כמעט יחד.

4. **פיצוץ התותח** ✅
   - הפעלת אנימציית פיצוץ קצרה.

5. **Restart של השלב** ✅
   - ניקוי אויבים וקליעים.
   - הפעלה מחדש של השלב הנוכחי.
   - שמירת Score.
   - שמירת מספר החיים שנותר.

6. **יצירת Level Configuration** ✅
   - הגדרת 10 שלבים.
   - טווחי Enemy Count.
   - טווחי Spawn Rate.
   - טווחי Speed.
   - הסתברויות לסוגי אויבים.

7. **Randomization מבוקר** ✅
   - שלב שונה מעט בכל משחק.
   - שמירת רמת קושי דומה.

8. **זיהוי השלמת שלב** ✅
   - כל האויבים נוצרו.
   - אין אויב פעיל נוסף.

9. **הודעת Level Complete** ✅
   - הצגת "שלב X הושלם".
   - מעבר אוטומטי לשלב הבא.

10. **Win** ✅
    - השלמת שלב 10.
    - מעבר למסך סיום בניצחון.

11. **Loss** ✅
    - איבוד החיים השלישי.
    - מעבר למסך סיום בהפסד.

12. **HUD מלא** ✅
    - Score.
    - Lives.
    - Current Level.
    - Enemies Remaining.

### Definition of Done

- [x] ניתן לשחק רצף מלא של 10 שלבים.
- [x] החיים עובדים נכון.
- [x] שלב מתחיל מחדש לאחר פגיעה.
- [x] Score נשמר בין ניסיונות ובין שלבים.
- [x] המשחק מזהה Win ו־Loss.

---

## Milestone 5 – Complete Game UI & User Flows ✅

מטרת ה־Milestone: להשלים את כל המסכים והזרימות בהתאם ל־PRD ול־Mockups.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-5.md`.

### Slices

1. **מסך ראשי מלא** ✅
   - לוגו.
   - שם המשחק.
   - כפתור "התחל".

2. **Game HUD מעוצב** ✅
   - ניקוד.
   - חיים.
   - שלב.
   - אויבים שנותרו.
   - Sound Toggle.
   - "סיים משחק".

3. **חסימת Navigation בזמן משחק** ✅
   - הסתרה או Disable של התפריט.

4. **Confirmation לסיום משחק** ✅
   - הצגת Dialog:
     - "האם אתה בטוח שברצונך לסיים את המשחק?"
   - ביטול.
   - אישור.

5. **סיום משחק יזום** ✅
   - עצירת Game Loop.
   - ניקוי Game State.
   - חזרה למסך הראשי.
   - ללא שמירת Statistics.

6. **מסך Game Over** ✅
   - Win / Loss.
   - Final Score.
   - Level Reached.
   - כפתור "משחק חדש".

7. **מסך How To Play** ✅
   - מטרת המשחק.
   - איך משחקים.
   - חיים.
   - מעבר שלב.
   - הפסד.

8. **מסך About** ✅
   - לוגו.
   - Space Shooter.
   - גרסה 1.0.
   - טקסט קצר.
   - קרדיט: אסף פינקלשטיין.

9. **יישור מלא ל־Mockups** ✅
   - צבעים.
   - Spacing.
   - Borders.
   - Buttons.
   - Cards.
   - Typography.

### Definition of Done

- [x] כל המסכים תואמים לזרימות שהוגדרו ב־PRD.
- [x] ניתן לבצע את כל User Flows מתחילתם ועד סופם.
- [x] העיצוב תואם ל־Style Guide ול־Mockups.

> הערה: Sound Toggle ממומש כ-UI + State בזיכרון בלבד (אין אודיו אמיתי — Milestone 7;
> אין שמירת ההעדפה ב-localStorage — Milestone 6). מסך הסטטיסטיקות נשאר במצב
> "אין נתונים" (הצגת נתונים אמיתיים — Milestone 6). ראו `spec/plans/milestone-5.md §1`.

---

## Milestone 6 – Persistence & Statistics ✅

מטרת ה־Milestone: לשמור תוצאות משחק והעדפות מקומיות באמצעות `localStorage`.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-6.md`.

### Slices

1. **יצירת Storage Service** ✅
   - `getStatistics()`
   - `saveGameResult()`
   - `getSoundMuted()`
   - `setSoundMuted()`

2. **יצירת Game Result Model** ✅
   - ID.
   - Date.
   - Final Score.
   - Level Reached.
   - Win / Loss.

3. **שמירת ניצחון** ✅
   - שמירת Result לאחר השלמת Level 10.

4. **שמירת הפסד** ✅
   - שמירת Result לאחר איבוד 3 חיים.

5. **אי־שמירת משחק שננטש** ✅
   - סיום יזום.
   - Refresh.
   - סגירת Browser/PWA.

6. **מסך Statistics** ✅
   - קריאה מ־localStorage.
   - הצגה בטבלה.

7. **מיון Statistics** ✅
   - המשחק האחרון מופיע ראשון.

8. **מצב ללא נתונים** ✅
   - הצגת:
     - "עדיין אין משחקים קודמים להצגה".

9. **Error Handling** ✅
   - טיפול ב־JSON לא תקין.
   - שימוש בערכי Default בטוחים.

10. **שמירת Sound Preference** ✅
    - שמירת מצב Mute.
    - טעינה מחדש של ההעדפה בכניסה הבאה.

### Definition of Done

- [x] Win ו־Loss נשמרים נכון.
- [x] משחקים שננטשו אינם נשמרים.
- [x] Statistics נשמרים גם לאחר סגירת הדפדפן.
- [x] Sound Preference נשמר.
- [x] נתונים פגומים אינם גורמים ל־Crash.

---

## Milestone 7 – Audio & Visual Polish ✅

מטרת ה־Milestone: להפוך את המשחק מ־Prototype למוצר מלא מבחינת Audio ו־Visual Feedback.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-7.md`.
> אודיו מסונתז ב-Web Audio API (ללא קבצים); נכסים גרפיים נגזרו מ-`spec/style-guide.png`
> (`tools/extract-sprites.py` → `src/assets/images/`) עם נפילה חזרה ל-Vector Art.

### Slices

1. **יצירת Audio Service** ✅
   - ניהול מרכזי של כל Audio.

2. **Background Music** ✅
   - מוזיקה דרמטית.
   - Loop.
   - פעילה בכלל האפליקציה.

3. **טיפול ב־Browser Autoplay** ✅
   - התחלת Audio לאחר User Interaction ראשון במידת הצורך.

4. **Laser Sound** ✅
   - אפקט קול לכל ירייה.

5. **Enemy Explosion Sound** ✅
   - אפקט קול בחיסול Enemy.

6. **Cannon Explosion Sound** ✅
   - אפקט קול באיבוד חיים.

7. **Sound Toggle** ✅
   - השתקת כל Audio יחד.
   - Unmute של כל Audio יחד.

8. **Explosion Animation** ✅
   - אנימציה מלאה לאויבים.
   - אנימציה מלאה לתותח.

9. **Visual Feedback לפגיעה** ✅
   - משוב ברור כאשר Enemy סופג פגיעה גם אם לא חוסל.

10. **Asset Integration** ✅
    - Cannon.
    - Enemies.
    - Background.
    - Laser.
    - Explosions.
    - Logo.
    - Icons.

11. **Polish של מעברים** ✅
    - Level Complete.
    - Game Over.
    - Dialogs.
    - Buttons.

### Definition of Done

- [x] כל ה־Audio פועל.
- [x] Mute/Unmute פועל.
- [x] כל Assets המרכזיים משולבים.
- [x] המשחק נראה ומרגיש בהתאם ל־Style Guide.

> הערות: (1) רקע ה-Canvas נשאר Vector Starfield (חד וסקיילבילי לכל גודל); הרקע
> הגזור משמש כ-backdrop במסך הראשי. הלוגו נשאר `Wordmark` (CSS) — לא ניתן לגזור
> נקי מרקע הכוכבים; שאר הנכסים נגזרו. אייקוני ה-UI נשארו אמוג'י/CSS כפי שהיו.
> (2) אימות אנימציית ה-Game Loop ושמיעת האודיו בפועל דורשים חלון גלוי עם רמקולים
> (rAF מושהה כשה-preview מוסתר) — לבדיקת המפתח.

---

## Milestone 8 – Responsive, Mobile & PWA ✅

מטרת ה־Milestone: להשלים התאמה למובייל, Orientation, PWA ו־Offline.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-8.md`.

### Slices

1. **Mobile First Layout** ✅
   - התאמת כל המסכים למסכי Mobile מודרניים.

2. **Portrait Support** ✅
   - בדיקת כל המסכים והמשחק ב־Portrait.

3. **Landscape Support** ✅
   - בדיקת כל המסכים והמשחק ב־Landscape.

4. **Orientation Change בזמן משחק** ✅
   - זיהוי שינוי גודל.
   - Resize של Canvas.
   - Reposition של Cannon.
   - איפוס קצר מותר לאובייקטים.
   - שמירת Score, Lives ו־Level.

5. **Touch Optimization** ✅
   - אזורי Touch נוחים.
   - מניעת Scroll או Gestures לא רצויים באזור המשחק.

6. **Desktop Support** ✅
   - Mouse Click.
   - Layout רספונסיבי בסיסי.

7. **Web App Manifest** ✅
   - Name.
   - Short Name.
   - Icons.
   - Theme Color.
   - Start URL.
   - Standalone Display.

8. **Service Worker** ✅
   - Cache של קבצי האפליקציה.

9. **Offline Assets** ✅
   - Images.
   - Audio.
   - CSS.
   - JavaScript.
   - Icons.
   - Fonts מקומיים אם קיימים.

10. **Offline Validation** ✅
    - פתיחת המשחק ללא אינטרנט.
    - התחלת משחק.
    - מעבר בין מסכים.
    - Audio מקומי.
    - Statistics.

11. **PWA Installability** ✅
    - בדיקה שהאפליקציה ניתנת להתקנה ב־Chrome וב־Edge.
    - ללא כפתור Install ייעודי בתוך האפליקציה.

### Definition of Done

- [x] המשחק עובד ב־Mobile Portrait וב־Mobile Landscape.
- [x] Orientation יכול להשתנות באמצע משחק.
- [x] המשחק עובד ב־Chrome וב־Edge.
- [x] האפליקציה ניתנת להתקנה כ־PWA.
- [x] האפליקציה עובדת Offline.

> הערה: `vite-plugin-pwa` (Workbox) מייצר Service Worker עם Precache אוטומטי
> של כל קבצי ה-Build (JS/CSS/HTML/תמונות/פונטים) — ראו `vite.config.ts`.
> אייקוני ה-PWA (192/512/512-maskable/apple-touch) נגזרו מ-`public/favicon.svg`
> דרך `tools/generate-pwa-icons.mjs`. **אימות Service Worker/Offline בפועל
> (התקנה, ריצה ללא אינטרנט) דורש דפדפן אמיתי (Chrome/Edge)** — סביבת
> ה-Preview האוטומטית של Claude Code חוסמת רישום Service Worker לחלוטין
> (`navigator.serviceWorker.register()` נכשל אפילו עבור קובץ SW מינימלי) —
> לבדיקת המפתח. Manifest, Icons, ו-Build המכיל SW תקין אומתו ישירות.

---

## Milestone 9 – QA & MVP Release ✅

מטרת ה־Milestone: לבדוק את כל המערכת, לתקן באגים ולוודא שה־MVP מוכן לשימוש.

> הושלם. תוכנית מפורטת: `spec/plans/milestone-9.md`. דוח מלא: `spec/QA-REPORT.md`.

### Slices

1. **בדיקות Core Gameplay** ✅
   - Enemy קטן.
   - Enemy בינוני.
   - Enemy גדול.
   - ירי לשטח ריק.
   - פגיעה באויב שאינו היעד המקורי.
   - חיסול.
   - Score.

2. **בדיקות חיים** ✅
   - פגיעה אחת.
   - כמה אויבים שפוגעים יחד.
   - Restart Level.
   - Loss לאחר 3 חיים.

3. **בדיקות Levels** ✅
   - מעבר בין שלבים.
   - Level Complete.
   - Level 10.
   - Win.

4. **בדיקות Randomization** ✅
   - שלבים אינם זהים.
   - הקושי נשאר סביר.

5. **בדיקות Statistics** ✅
   - Win נשמר.
   - Loss נשמר.
   - Abandoned Game אינו נשמר.
   - סדר נכון.
   - מצב ללא נתונים.

6. **בדיקות Audio** ✅
   - Music.
   - Shooting.
   - Explosions.
   - Mute.
   - Persistence.

7. **בדיקות Navigation** ✅
   - Navigation רגיל מחוץ למשחק.
   - Navigation חסום בזמן משחק.
   - "סיים משחק" עובד נכון.

8. **בדיקות Refresh / Close** ✅
   - Refresh בזמן משחק.
   - סגירת Tab.
   - פתיחה מחדש.
   - אין Resume.

9. **בדיקות Responsive** ✅
   - מספר גדלי Mobile.
   - Portrait.
   - Landscape.
   - שינוי Orientation בזמן משחק.

10. **בדיקות Browser** ✅
    - Chrome Desktop.
    - Edge Desktop.
    - Chrome Mobile.
    - Edge Mobile כאשר רלוונטי.

11. **בדיקות PWA** ✅
    - Install.
    - Standalone.
    - Offline.
    - Cache.

12. **בדיקות Code Quality** ✅
    - TypeScript ללא Errors.
    - אין Console Errors.
    - אין Game Loop שנשאר פעיל.
    - Event Listeners מנוקים.
    - אין Dead Code משמעותי.

13. **כיוונון רמת קושי** ✅
    - בדיקה שהמשחק מתאים לילדים בגילאי 6–12.
    - התאמת Speed.
    - התאמת Spawn Rate.
    - התאמת Enemy Counts.

14. **Final Visual Review** ✅
    - התאמה ל־Mockups.
    - התאמה ל־Style Guide.
    - עקביות בין מסכים.

15. **Production Build** ✅
    - יצירת Build סופי.
    - בדיקת Build מקומי.
    - תיקון בעיות אחרונות.

### Definition of Done

ה־MVP נחשב מוכן כאשר:

- [x] כל 10 השלבים עובדים.
- [x] ניתן לנצח ולהפסיד.
- [x] כל חוקי המשחק עובדים.
- [x] Statistics נשמרים נכון.
- [x] Audio עובד.
- [x] Responsive ו־Orientation עובדים.
- [x] PWA ו־Offline עובדים.
- [x] אין תקלות שחוסמות משחק מלא.
- [x] העיצוב תואם ל־Mockups ול־Style Guide.
- [x] הפרויקט עובר Build ו־TypeScript Type Checking בהצלחה.

> **ממצאים ותיקונים:** סקירת קוד ממוקדת חשפה 8 ממצאים אמיתיים (F1–F8) —
> כולם תוקנו. העיקריים: שמירת תוצאה שנכשלה בשקט ב-Non-Secure Context
> (`crypto.randomUUID`), סיבוב מכשיר באמצע שלב שיכול היה להעלים אויבים או
> לגרום לאיבוד חיים לא הוגן, ורמת קושי שהייתה תלויה בגובה המסך (Landscape
> קשה משמעותית מ-Portrait). פירוט מלא ב-`spec/QA-REPORT.md` §2.
>
> **בדיקות אוטומטיות:** נוספה סוויטת Vitest (תלות dev חדשה יחידה) — 60
> בדיקות, כולן עוברות, מכסות את כל התרחישים הנדרשים (ARCHITECTURE §60)
> כולל Resize/Orientation, Hit Lock, ו-Persistence. `spec/QA-REPORT.md` §3.
>
> **כיוונון קושי:** שלבים 8–10 רוככו מעט לאחר תיקון תלות הקושי בגובה המסך
> (F6); שלבים 1–7 ללא שינוי. `spec/QA-REPORT.md` §4.
>
> **הערות קוד:** כל ~46 הקבצים תורגמו מעברית לאנגלית לפי קונבנציית
> `CLAUDE.md`; מחרוזות UI בעברית נשארו כמות שהן.
>
> **מגבלת סביבה (כמו M7/M8):** סביבת ה-Preview האוטומטית משהה
> `requestAnimationFrame` כשהחלון אינו קדמי/גלוי — אומת ישירות. משחקיות
> מלאה (ירי, חיסול, מעבר שלבים) נצפתה ותקינה כשהחלון קדמי; תזמונים (Resize
> באמצע-אנימציה, השהיית מוזיקה ברקע) מכוסים ב-Vitest ללא תלות ב-rAF אמיתי.
> **סעיפים הדורשים בדיקת המפתח במכשיר/דפדפן אמיתי** (אודיו בפועל, Chrome/
> Edge בפועל, התקנת PWA, Offline, Playtest קושי לילד בגיל היעד) — Checklist
> מלא כולל הוראות ל-PWA/Offline בטלפון ללא Deploy ב-`spec/QA-REPORT.md` §6.

---

# סדר העבודה

יש לבצע את ה־Milestones לפי הסדר:

```text
Milestone 1 – Project Foundation
        ↓
Milestone 2 – Core Game Prototype
        ↓
Milestone 3 – Enemies & Combat
        ↓
Milestone 4 – Lives, Levels & Game Rules
        ↓
Milestone 5 – Complete Game UI & User Flows
        ↓
Milestone 6 – Persistence & Statistics
        ↓
Milestone 7 – Audio & Visual Polish
        ↓
Milestone 8 – Responsive, Mobile & PWA
        ↓
Milestone 9 – QA & MVP Release
```

יש להשלים ולבדוק כל Milestone לפני מעבר ל־Milestone הבא.
