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

## Milestone 3 – Enemies & Combat

מטרת ה־Milestone: להוסיף אויבים, פגיעות, Collision Detection וניקוד.

### Slices

1. **יצירת Enemy Model**
   - הגדרת Enemy Type.
   - מיקום.
   - מהירות.
   - גודל.
   - Hit Points.
   - Score Value.

2. **יצירת שלושת סוגי האויבים**
   - קטן: פגיעה אחת, נקודה אחת.
   - בינוני: שתי פגיעות, שתי נקודות.
   - גדול: שלוש פגיעות, שלוש נקודות.

3. **Enemy Spawner בסיסי**
   - יצירת אויבים בהדרגה.
   - Spawn בחלק העליון של המסך.
   - מיקום X אקראי.

4. **תנועת אויבים**
   - תנועה בקו כמעט ישר לכיוון התותח.
   - Random Variation קטן במהירות ובמסלול.

5. **Projectile–Enemy Collision**
   - זיהוי פגיעה.
   - הקליע נעלם לאחר פגיעה ראשונה.

6. **מערכת Hit Points**
   - הורדת Hit Point בכל פגיעה.
   - אויב ממשיך לנוע אם לא חוסל.

7. **חיסול אויב**
   - הסרת Enemy לאחר שהגיע ל־0 Hit Points.
   - הפעלת אנימציית פיצוץ.

8. **מערכת ניקוד**
   - עדכון Score בהתאם לגודל האויב.

9. **HUD ראשוני**
   - הצגת Score.
   - הצגת מספר אויבים שנותרו.

### Definition of Done

- אויבים מופיעים ונעים לכיוון התותח.
- שלושת סוגי האויבים עובדים.
- פגיעות מזוהות נכון.
- קליע נעלם לאחר פגיעה.
- אויבים מתחסלים בהתאם למספר הפגיעות שלהם.
- הניקוד מתעדכן נכון.

---

## Milestone 4 – Lives, Levels & Game Rules

מטרת ה־Milestone: להשלים את חוקי המשחק המרכזיים, החיים, השלבים, Win ו־Loss.

### Slices

1. **Enemy–Cannon Collision**
   - זיהוי מגע בין אויב לתותח.

2. **מערכת חיים**
   - התחלת משחק עם 3 חיים.
   - הורדת חיים אחד בפגיעה.

3. **Hit Lock**
   - מניעת איבוד יותר מחיים אחד כאשר כמה אויבים פוגעים כמעט יחד.

4. **פיצוץ התותח**
   - הפעלת אנימציית פיצוץ קצרה.

5. **Restart של השלב**
   - ניקוי אויבים וקליעים.
   - הפעלה מחדש של השלב הנוכחי.
   - שמירת Score.
   - שמירת מספר החיים שנותר.

6. **יצירת Level Configuration**
   - הגדרת 10 שלבים.
   - טווחי Enemy Count.
   - טווחי Spawn Rate.
   - טווחי Speed.
   - הסתברויות לסוגי אויבים.

7. **Randomization מבוקר**
   - שלב שונה מעט בכל משחק.
   - שמירת רמת קושי דומה.

8. **זיהוי השלמת שלב**
   - כל האויבים נוצרו.
   - אין אויב פעיל נוסף.

9. **הודעת Level Complete**
   - הצגת "שלב X הושלם".
   - מעבר אוטומטי לשלב הבא.

10. **Win**
    - השלמת שלב 10.
    - מעבר למסך סיום בניצחון.

11. **Loss**
    - איבוד החיים השלישי.
    - מעבר למסך סיום בהפסד.

12. **HUD מלא**
    - Score.
    - Lives.
    - Current Level.
    - Enemies Remaining.

### Definition of Done

- ניתן לשחק רצף מלא של 10 שלבים.
- החיים עובדים נכון.
- שלב מתחיל מחדש לאחר פגיעה.
- Score נשמר בין ניסיונות ובין שלבים.
- המשחק מזהה Win ו־Loss.

---

## Milestone 5 – Complete Game UI & User Flows

מטרת ה־Milestone: להשלים את כל המסכים והזרימות בהתאם ל־PRD ול־Mockups.

### Slices

1. **מסך ראשי מלא**
   - לוגו.
   - שם המשחק.
   - כפתור "התחל".

2. **Game HUD מעוצב**
   - ניקוד.
   - חיים.
   - שלב.
   - אויבים שנותרו.
   - Sound Toggle.
   - "סיים משחק".

3. **חסימת Navigation בזמן משחק**
   - הסתרה או Disable של התפריט.

4. **Confirmation לסיום משחק**
   - הצגת Dialog:
     - "האם אתה בטוח שברצונך לסיים את המשחק?"
   - ביטול.
   - אישור.

5. **סיום משחק יזום**
   - עצירת Game Loop.
   - ניקוי Game State.
   - חזרה למסך הראשי.
   - ללא שמירת Statistics.

6. **מסך Game Over**
   - Win / Loss.
   - Final Score.
   - Level Reached.
   - כפתור "משחק חדש".

7. **מסך How To Play**
   - מטרת המשחק.
   - איך משחקים.
   - חיים.
   - מעבר שלב.
   - הפסד.

8. **מסך About**
   - לוגו.
   - Space Shooter.
   - גרסה 1.0.
   - טקסט קצר.
   - קרדיט: אסף פינקלשטיין.

9. **יישור מלא ל־Mockups**
   - צבעים.
   - Spacing.
   - Borders.
   - Buttons.
   - Cards.
   - Typography.

### Definition of Done

- כל המסכים תואמים לזרימות שהוגדרו ב־PRD.
- ניתן לבצע את כל User Flows מתחילתם ועד סופם.
- העיצוב תואם ל־Style Guide ול־Mockups.

---

## Milestone 6 – Persistence & Statistics

מטרת ה־Milestone: לשמור תוצאות משחק והעדפות מקומיות באמצעות `localStorage`.

### Slices

1. **יצירת Storage Service**
   - `getStatistics()`
   - `saveGameResult()`
   - `getSoundMuted()`
   - `setSoundMuted()`

2. **יצירת Game Result Model**
   - ID.
   - Date.
   - Final Score.
   - Level Reached.
   - Win / Loss.

3. **שמירת ניצחון**
   - שמירת Result לאחר השלמת Level 10.

4. **שמירת הפסד**
   - שמירת Result לאחר איבוד 3 חיים.

5. **אי־שמירת משחק שננטש**
   - סיום יזום.
   - Refresh.
   - סגירת Browser/PWA.

6. **מסך Statistics**
   - קריאה מ־localStorage.
   - הצגה בטבלה.

7. **מיון Statistics**
   - המשחק האחרון מופיע ראשון.

8. **מצב ללא נתונים**
   - הצגת:
     - "עדיין אין משחקים קודמים להצגה".

9. **Error Handling**
   - טיפול ב־JSON לא תקין.
   - שימוש בערכי Default בטוחים.

10. **שמירת Sound Preference**
    - שמירת מצב Mute.
    - טעינה מחדש של ההעדפה בכניסה הבאה.

### Definition of Done

- Win ו־Loss נשמרים נכון.
- משחקים שננטשו אינם נשמרים.
- Statistics נשמרים גם לאחר סגירת הדפדפן.
- Sound Preference נשמר.
- נתונים פגומים אינם גורמים ל־Crash.

---

## Milestone 7 – Audio & Visual Polish

מטרת ה־Milestone: להפוך את המשחק מ־Prototype למוצר מלא מבחינת Audio ו־Visual Feedback.

### Slices

1. **יצירת Audio Service**
   - ניהול מרכזי של כל Audio.

2. **Background Music**
   - מוזיקה דרמטית.
   - Loop.
   - פעילה בכלל האפליקציה.

3. **טיפול ב־Browser Autoplay**
   - התחלת Audio לאחר User Interaction ראשון במידת הצורך.

4. **Laser Sound**
   - אפקט קול לכל ירייה.

5. **Enemy Explosion Sound**
   - אפקט קול בחיסול Enemy.

6. **Cannon Explosion Sound**
   - אפקט קול באיבוד חיים.

7. **Sound Toggle**
   - השתקת כל Audio יחד.
   - Unmute של כל Audio יחד.

8. **Explosion Animation**
   - אנימציה מלאה לאויבים.
   - אנימציה מלאה לתותח.

9. **Visual Feedback לפגיעה**
   - משוב ברור כאשר Enemy סופג פגיעה גם אם לא חוסל.

10. **Asset Integration**
    - Cannon.
    - Enemies.
    - Background.
    - Laser.
    - Explosions.
    - Logo.
    - Icons.

11. **Polish של מעברים**
    - Level Complete.
    - Game Over.
    - Dialogs.
    - Buttons.

### Definition of Done

- כל ה־Audio פועל.
- Mute/Unmute פועל.
- כל Assets המרכזיים משולבים.
- המשחק נראה ומרגיש בהתאם ל־Style Guide.

---

## Milestone 8 – Responsive, Mobile & PWA

מטרת ה־Milestone: להשלים התאמה למובייל, Orientation, PWA ו־Offline.

### Slices

1. **Mobile First Layout**
   - התאמת כל המסכים למסכי Mobile מודרניים.

2. **Portrait Support**
   - בדיקת כל המסכים והמשחק ב־Portrait.

3. **Landscape Support**
   - בדיקת כל המסכים והמשחק ב־Landscape.

4. **Orientation Change בזמן משחק**
   - זיהוי שינוי גודל.
   - Resize של Canvas.
   - Reposition של Cannon.
   - איפוס קצר מותר לאובייקטים.
   - שמירת Score, Lives ו־Level.

5. **Touch Optimization**
   - אזורי Touch נוחים.
   - מניעת Scroll או Gestures לא רצויים באזור המשחק.

6. **Desktop Support**
   - Mouse Click.
   - Layout רספונסיבי בסיסי.

7. **Web App Manifest**
   - Name.
   - Short Name.
   - Icons.
   - Theme Color.
   - Start URL.
   - Standalone Display.

8. **Service Worker**
   - Cache של קבצי האפליקציה.

9. **Offline Assets**
   - Images.
   - Audio.
   - CSS.
   - JavaScript.
   - Icons.
   - Fonts מקומיים אם קיימים.

10. **Offline Validation**
    - פתיחת המשחק ללא אינטרנט.
    - התחלת משחק.
    - מעבר בין מסכים.
    - Audio מקומי.
    - Statistics.

11. **PWA Installability**
    - בדיקה שהאפליקציה ניתנת להתקנה ב־Chrome וב־Edge.
    - ללא כפתור Install ייעודי בתוך האפליקציה.

### Definition of Done

- המשחק עובד ב־Mobile Portrait וב־Mobile Landscape.
- Orientation יכול להשתנות באמצע משחק.
- המשחק עובד ב־Chrome וב־Edge.
- האפליקציה ניתנת להתקנה כ־PWA.
- האפליקציה עובדת Offline.

---

## Milestone 9 – QA & MVP Release

מטרת ה־Milestone: לבדוק את כל המערכת, לתקן באגים ולוודא שה־MVP מוכן לשימוש.

### Slices

1. **בדיקות Core Gameplay**
   - Enemy קטן.
   - Enemy בינוני.
   - Enemy גדול.
   - ירי לשטח ריק.
   - פגיעה באויב שאינו היעד המקורי.
   - חיסול.
   - Score.

2. **בדיקות חיים**
   - פגיעה אחת.
   - כמה אויבים שפוגעים יחד.
   - Restart Level.
   - Loss לאחר 3 חיים.

3. **בדיקות Levels**
   - מעבר בין שלבים.
   - Level Complete.
   - Level 10.
   - Win.

4. **בדיקות Randomization**
   - שלבים אינם זהים.
   - הקושי נשאר סביר.

5. **בדיקות Statistics**
   - Win נשמר.
   - Loss נשמר.
   - Abandoned Game אינו נשמר.
   - סדר נכון.
   - מצב ללא נתונים.

6. **בדיקות Audio**
   - Music.
   - Shooting.
   - Explosions.
   - Mute.
   - Persistence.

7. **בדיקות Navigation**
   - Navigation רגיל מחוץ למשחק.
   - Navigation חסום בזמן משחק.
   - "סיים משחק" עובד נכון.

8. **בדיקות Refresh / Close**
   - Refresh בזמן משחק.
   - סגירת Tab.
   - פתיחה מחדש.
   - אין Resume.

9. **בדיקות Responsive**
   - מספר גדלי Mobile.
   - Portrait.
   - Landscape.
   - שינוי Orientation בזמן משחק.

10. **בדיקות Browser**
    - Chrome Desktop.
    - Edge Desktop.
    - Chrome Mobile.
    - Edge Mobile כאשר רלוונטי.

11. **בדיקות PWA**
    - Install.
    - Standalone.
    - Offline.
    - Cache.

12. **בדיקות Code Quality**
    - TypeScript ללא Errors.
    - אין Console Errors.
    - אין Game Loop שנשאר פעיל.
    - Event Listeners מנוקים.
    - אין Dead Code משמעותי.

13. **כיוונון רמת קושי**
    - בדיקה שהמשחק מתאים לילדים בגילאי 6–12.
    - התאמת Speed.
    - התאמת Spawn Rate.
    - התאמת Enemy Counts.

14. **Final Visual Review**
    - התאמה ל־Mockups.
    - התאמה ל־Style Guide.
    - עקביות בין מסכים.

15. **Production Build**
    - יצירת Build סופי.
    - בדיקת Build מקומי.
    - תיקון בעיות אחרונות.

### Definition of Done

ה־MVP נחשב מוכן כאשר:

- כל 10 השלבים עובדים.
- ניתן לנצח ולהפסיד.
- כל חוקי המשחק עובדים.
- Statistics נשמרים נכון.
- Audio עובד.
- Responsive ו־Orientation עובדים.
- PWA ו־Offline עובדים.
- אין תקלות שחוסמות משחק מלא.
- העיצוב תואם ל־Mockups ול־Style Guide.
- הפרויקט עובר Build ו־TypeScript Type Checking בהצלחה.

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
