# Tech Requirements – Space Shooter

מסמך זה מגדיר את הדרישות הטכניות למימוש המשחק **Space Shooter**, בהתאם לדרישות המוצר המוגדרות במסמך ה־PRD.

מטרת המסמך היא לתאר את הטכנולוגיות, הארכיטקטורה, מבנה המערכת, ניהול הנתונים, מנגנון המשחק והאילוצים הטכניים הנדרשים לצורך מימוש המערכת.

---

# 1. Technology Stack

## 1.1 Frontend

יש להשתמש בטכנולוגיות הבאות:

* React
* TypeScript
* HTML5
* CSS
* HTML5 Canvas
* Vite

אין להשתמש ב־Backend.

אין להשתמש ב־Database.

כל האפליקציה צריכה לרוץ בצד ה־Client בלבד.

---

## 1.2 Codebase

יש להשתמש ב־Codebase אחד בלבד עבור:

* Desktop
* Mobile Portrait
* Mobile Landscape
* PWA

אין ליצור גרסה נפרדת עבור Mobile.

אין ליצור גרסה נפרדת עבור Desktop.

---

# 2. Application Architecture

האפליקציה תיבנה כאפליקציית React מסוג Single Page Application.

יש להפריד בין:

1. שכבת ה־UI.
2. מנגנון המשחק.
3. ניהול State.
4. שמירת נתונים.
5. ניהול Audio.
6. PWA ו־Offline.
7. Assets.

אין להכניס את כל לוגיקת המשחק לתוך React Component יחיד.

מנגנון המשחק עצמו צריך להיות מופרד ככל האפשר מה־UI של React.

---

# 3. Recommended Project Structure

מבנה מומלץ:

```text
src/
│
├── components/
│   ├── navigation/
│   ├── common/
│   └── game-ui/
│
├── pages/
│   ├── HomePage.tsx
│   ├── GamePage.tsx
│   ├── StatisticsPage.tsx
│   ├── HowToPlayPage.tsx
│   ├── AboutPage.tsx
│   └── GameOverPage.tsx
│
├── game/
│   ├── GameEngine.ts
│   ├── GameState.ts
│   ├── GameLoop.ts
│   ├── Enemy.ts
│   ├── Projectile.ts
│   ├── Cannon.ts
│   ├── CollisionManager.ts
│   ├── EnemySpawner.ts
│   ├── LevelManager.ts
│   ├── Renderer.ts
│   └── gameConfig.ts
│
├── services/
│   ├── storageService.ts
│   └── audioService.ts
│
├── hooks/
│   ├── useGame.ts
│   ├── useOrientation.ts
│   └── useAudio.ts
│
├── types/
│   ├── game.ts
│   └── statistics.ts
│
├── assets/
│   ├── images/
│   ├── audio/
│   └── icons/
│
├── styles/
│   ├── global.css
│   └── variables.css
│
├── App.tsx
└── main.tsx
```

המבנה יכול להשתנות במידת הצורך, אך יש לשמור על הפרדה ברורה בין מנגנון המשחק לבין רכיבי ה־UI.

---

# 4. Routing

האפליקציה צריכה להכיל את המסכים הבאים:

```text
/
 /game
 /statistics
 /how-to-play
 /about
 /game-over
```

ניתן להשתמש ב־Client Side Routing.

אין צורך ב־Server Side Routing.

בזמן משחק פעיל אין לאפשר ניווט למסכים אחרים דרך תפריט הניווט.

---

# 5. React Responsibilities

React יהיה אחראי על:

* מסכי האפליקציה.
* תפריטי ניווט.
* כפתורים.
* HUD של המשחק.
* הצגת ניקוד.
* הצגת חיים.
* הצגת מספר שלב.
* הצגת מספר אויבים שנותרו.
* Dialog לאישור סיום משחק.
* מסך סיום.
* מסך סטטיסטיקות.
* מסך הוראות.
* מסך אודות.
* ניהול Sound On / Sound Off.

React לא צריך לבצע Rendering של כל Enemy או Projectile כ־DOM Element נפרד.

האויבים, הקליעים, התותח והאנימציות יוצגו באמצעות Canvas.

---

# 6. HTML5 Canvas

אזור המשחק עצמו ימומש באמצעות HTML5 Canvas.

ה־Canvas יהיה אחראי על Rendering של:

* רקע המשחק.
* כוכבים.
* תותח הלייזר.
* אויבים.
* קליעי לייזר.
* אנימציות פיצוץ.

ה־Canvas צריך להתאים את עצמו באופן אוטומטי למידות אזור המשחק.

יש לקחת בחשבון `devicePixelRatio` כדי לשמור על Rendering חד גם במסכים בעלי צפיפות Pixel גבוהה.

---

# 7. Game Loop

מנגנון המשחק צריך להשתמש ב:

```ts
requestAnimationFrame()
```

אין להשתמש ב־`setInterval` כמנגנון הראשי של המשחק.

Game Loop בסיסי:

```text
requestAnimationFrame
        ↓
Calculate Delta Time
        ↓
Update Game State
        ↓
Move Enemies
        ↓
Move Projectiles
        ↓
Detect Collisions
        ↓
Process Destroyed Entities
        ↓
Render Canvas
        ↓
Next Frame
```

יש להשתמש ב־Delta Time כדי שתנועת האובייקטים לא תהיה תלויה ישירות ב־FPS.

---

# 8. Game State

יש להחזיק Game State מרכזי עבור משחק פעיל.

מבנה עקרוני:

```ts
interface GameState {
  status: GameStatus;
  currentLevel: number;
  score: number;
  lives: number;
  enemiesRemaining: number;
  enemies: Enemy[];
  projectiles: Projectile[];
}
```

`GameStatus` יכול לכלול לדוגמה:

```ts
type GameStatus =
  | "playing"
  | "level-complete"
  | "player-hit"
  | "won"
  | "lost";
```

Game State פעיל אינו נשמר ב־localStorage.

---

# 9. Initial Game State

כל משחק חדש מתחיל עם:

```text
Level: 1
Lives: 3
Score: 0
```

אין לטעון משחק קודם.

אין Resume Game.

---

# 10. Cannon

התותח נמצא בתחתית אזור המשחק.

התותח:

* קבוע במיקומו.
* אינו נע על ציר X או Y.
* מסתובב סביב מרכזו.
* מכוון לעבר נקודת הלחיצה של המשתמש.

יש לחשב את זווית הסיבוב באמצעות המיקום היחסי בין התותח לבין נקודת הלחיצה.

ניתן להשתמש בחישוב:

```ts
Math.atan2()
```

---

# 11. Input Handling

## Desktop

הירי מתבצע באמצעות Mouse Click.

## Mobile

הירי מתבצע באמצעות Touch.

יש להמיר את Coordinate של הלחיצה או הנגיעה ל־Coordinate המקומי של ה־Canvas.

כל Click או Touch יוצר Projectile אחד בלבד.

אין תמיכה ב:

* Keyboard Control.
* Gamepad.
* Drag.
* Swipe.
* Multi-touch shooting.

---

# 12. Projectile System

כל Projectile צריך להכיל לפחות:

```ts
interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
}
```

כאשר המשתמש לוחץ:

1. מחושבת נקודת היעד.
2. התותח מסתובב לכיוון היעד.
3. נוצר Projectile במיקום התותח.
4. מחושב Direction Vector לכיוון נקודת הלחיצה.
5. ה־Projectile נע לאורך אותו Vector.

אין צורך ב־Homing Projectile.

הקליע אינו ממשיך לעקוב אחרי Enemy לאחר הירי.

---

# 13. Projectile Collision

יש לבצע Collision Detection בין Projectile לבין Enemy.

אם Projectile פוגע ב־Enemy:

1. ה־Enemy מאבד Hit Point אחד.
2. ה־Projectile מסומן כלא פעיל ומוסר.
3. ה־Projectile אינו יכול לפגוע ב־Enemy נוסף.

אם Enemy מגיע ל־0 Hit Points:

1. מופעלת אנימציית פיצוץ.
2. ה־Enemy מוסר מהמשחק.
3. הניקוד מתעדכן.

---

# 14. Enemy Model

Enemy צריך לכלול לפחות:

```ts
type EnemySize = "small" | "medium" | "large";

interface Enemy {
  id: string;
  size: EnemySize;

  x: number;
  y: number;

  velocityX: number;
  velocityY: number;

  hitPoints: number;
  maxHitPoints: number;

  scoreValue: number;

  active: boolean;
}
```

---

# 15. Enemy Types

## Small Enemy

```text
Hit Points: 1
Score: 1
```

## Medium Enemy

```text
Hit Points: 2
Score: 2
```

## Large Enemy

```text
Hit Points: 3
Score: 3
```

הבדלת סוג האויב תתבצע באמצעות הגודל בלבד.

אין להציג Health Bar.

---

# 16. Enemy Movement

האויבים נוצרים בחלק העליון של אזור המשחק.

Position X שלהם יהיה אקראי.

האויב ינוע לכיוון התותח במסלול כמעט ישר.

בעת יצירת Enemy יש לחשב Vector ממיקום האויב אל מיקום התותח.

מהירות התנועה יכולה לכלול Random Variation קטן כדי למנוע תנועה זהה של כל האויבים.

אין צורך לבצע Collision Detection בין אויבים.

Enemy יכול לעבור דרך Enemy אחר.

---

# 17. Enemy Spawning

האויבים אינם נוצרים כולם בתחילת השלב.

יש להשתמש ב־EnemySpawner שמוסיף אויבים בהדרגה.

לכל Level יש להגדיר טווחים עבור:

* מספר אויבים.
* Spawn Rate.
* Enemy Speed.
* הסתברות להופעת Small Enemy.
* הסתברות להופעת Medium Enemy.
* הסתברות להופעת Large Enemy.

אין צורך להשתמש במספרים קבועים לחלוטין.

יש להשתמש ב־Randomization בתוך גבולות מוגדרים מראש.

---

# 18. Level Configuration

אין צורך לכתוב ידנית את כל פרטי כל האויבים.

יש ליצור Configuration מרכזי עבור 10 השלבים.

לדוגמה:

```ts
interface LevelConfig {
  level: number;

  enemyCountMin: number;
  enemyCountMax: number;

  spawnIntervalMin: number;
  spawnIntervalMax: number;

  enemySpeedMin: number;
  enemySpeedMax: number;

  smallEnemyProbability: number;
  mediumEnemyProbability: number;
  largeEnemyProbability: number;
}
```

לכל שלב יהיו ערכים מעט קשים יותר מהשלב הקודם.

יש לוודא שהקושי נשאר סביר לילדים בגילאי 6–12.

---

# 19. Randomization

יש להשתמש ב־Randomization עבור:

* מיקום Spawn של Enemy.
* זמן Spawn.
* מהירות Enemy.
* סוג Enemy.

Randomization חייב להיות מוגבל באמצעות Level Configuration.

אין ליצור קושי אקראי לחלוטין.

אותו Level יכול להיראות שונה במשחקים שונים, אך צריך להישאר באותה רמת קושי כללית.

---

# 20. Level Completion

Level מסתיים כאשר:

1. כל האויבים המתוכננים לאותו Level כבר נוצרו.
2. אין Enemy פעיל נוסף על המסך.

לאחר מכן:

```text
Game Status → level-complete
```

יש להציג הודעה:

```text
שלב X הושלם
```

לאחר השהיה קצרה יש להתחיל אוטומטית את השלב הבא.

אין צורך באינטראקציה מצד המשתמש.

---

# 21. Player Collision

יש לבצע Collision Detection בין Enemy לבין אזור הפגיעה של התותח.

כאשר Enemy פוגע בתותח:

1. יש לעצור זמנית את ה־Game State.
2. יש למנוע פגיעות נוספות.
3. יש להפעיל אנימציית פיצוץ של התותח.
4. יש להפחית חיים אחד בלבד.

יש להשתמש ב־Hit Lock או State מתאים כדי למנוע מכמה Enemy שפוגעים כמעט בו-זמנית להוריד מספר חיים.

---

# 22. Restart Level After Hit

אם לאחר הפגיעה:

```text
lives > 0
```

יש:

1. למחוק את כל האויבים הפעילים.
2. למחוק את כל הקליעים הפעילים.
3. לאפס את EnemySpawner.
4. להתחיל מחדש את ה־Level הנוכחי.

אין לאפס:

* Score.
* Current Level.
* מספר החיים הנותר.

---

# 23. Game Over

אם:

```text
lives === 0
```

יש לסיים את המשחק.

יש ליצור Game Result מסוג:

```text
loss
```

ולהעביר למסך Game Over.

---

# 24. Victory

לאחר השלמת Level 10:

יש לסיים את המשחק.

יש ליצור Game Result מסוג:

```text
win
```

ולהעביר למסך Game Over.

---

# 25. Game Result Model

מבנה מומלץ:

```ts
type GameResultType = "win" | "loss";

interface GameResult {
  id: string;
  date: string;
  finalScore: number;
  levelReached: number;
  result: GameResultType;
}
```

`date` יישמר בפורמט סטנדרטי כגון ISO 8601.

הצגת התאריך למשתמש תהיה בפורמט ידידותי.

---

# 26. localStorage

יש להשתמש ב־localStorage בלבד לצורך Persistent Data.

מפתחות מומלצים:

```text
spaceShooter.statistics
spaceShooter.soundMuted
```

---

# 27. Statistics Storage

`spaceShooter.statistics` ישמור Array של Game Results.

לדוגמה:

```json
[
  {
    "id": "game-123",
    "date": "2026-09-12T18:30:00.000Z",
    "finalScore": 82,
    "levelReached": 7,
    "result": "loss"
  }
]
```

אין הגבלה מלאכותית על מספר המשחקים הנשמרים.

בעת הצגת הנתונים יש להציג את המשחק החדש ביותר ראשון.

---

# 28. When Statistics Are Saved

יש לשמור Game Result רק כאשר המשחק מסתיים באמצעות:

* ניצחון.
* הפסד.

אין לשמור Game Result כאשר:

* המשתמש לוחץ "סיים משחק".
* המשתמש סוגר את הדפדפן.
* המשתמש סוגר את ה־PWA.
* המשתמש מרענן את הדף.
* המשחק נפסק מסיבה שאינה Win או Loss.

---

# 29. Statistics Screen

הנתונים יוצגו כטבלה.

עמודות:

```text
תאריך
ניקוד
שלב
תוצאה
```

יש לבצע Rendering של הנתונים מתוך localStorage.

אין אפשרות:

* למחוק שורה.
* לערוך שורה.
* לנקות סטטיסטיקות.

אם אין נתונים יש להציג:

```text
עדיין אין משחקים קודמים להצגה
```

---

# 30. Audio Architecture

יש ליצור Audio Service מרכזי.

האחריות שלו:

* Background Music.
* Laser Sound.
* Enemy Explosion Sound.
* Cannon Explosion Sound.
* Mute / Unmute.
* שמירת הגדרת Mute.

אין לנהל Audio בנפרד בכל Component.

---

# 31. Background Music

Background Music צריכה:

* להתנגן בלולאה.
* לפעול בכלל האפליקציה.
* להמשיך גם במעבר בין מסכים ככל שניתן.
* לא להתחיל מחדש בכל שינוי Route.

יש לקחת בחשבון מגבלות Browser Autoplay.

אם Browser אינו מאפשר Audio לפני User Interaction, יש להתחיל את המוזיקה לאחר האינטראקציה הראשונה של המשתמש.

---

# 32. Sound Settings

המערכת תכיל State אחד:

```ts
soundMuted: boolean
```

כאשר:

```text
soundMuted = true
```

יש להשתיק את כל Audio באפליקציה.

כאשר:

```text
soundMuted = false
```

יש לאפשר את כל Audio.

אין Volume Slider.

אין שליטה נפרדת בין Music לבין Sound Effects.

---

# 33. Sound Persistence

הערך `soundMuted` יישמר ב:

```text
spaceShooter.soundMuted
```

בטעינת האפליקציה יש לקרוא את הערך ולהחיל אותו.

---

# 34. Responsive Design

האפליקציה תפותח בגישת Mobile First.

יש להימנע ממידות Pixel קשיחות עבור Layout מרכזי.

יש להשתמש בהתאם לצורך ב:

* Flexbox.
* CSS Grid.
* Relative Units.
* `clamp()`.
* Media Queries.

---

# 35. Mobile Orientation

יש לתמוך גם ב:

```text
Portrait
Landscape
```

אין לבצע Orientation Lock.

בעת שינוי Orientation יש:

1. לזהות שינוי בגודל המסך.
2. לחשב מחדש את גודל ה־Canvas.
3. להתאים את מיקום התותח.
4. להתאים את אזור המשחק.

מותר לבצע Reposition קצר של Enemy ו־Projectile.

אין לאפס:

* Score.
* Lives.
* Current Level.

---

# 36. Canvas Resize

אין להסתמך רק על Orientation Events.

יש להגיב בפועל לשינוי Size של Container או Window.

לאחר Resize יש לעדכן:

```text
Canvas CSS Size
Canvas Internal Resolution
Cannon Position
Game Bounds
```

---

# 37. RTL

יש להגדיר:

```html
dir="rtl"
```

עבור ממשק האפליקציה.

ה־UI של:

* Navigation.
* Statistics.
* How To Play.
* About.
* Game Over.

יהיה RTL.

מערכת ה־Coordinate של Canvas תישאר רגילה ולא תתהפך.

---

# 38. Navigation

## Desktop

יש להציג Navigation Menu רגיל.

## Mobile

יש להשתמש ב־Hamburger Menu.

פריטי התפריט:

```text
ראשי
סטטיסטיקות
איך לשחק
אודות
```

---

# 39. Navigation During Active Game

בזמן משחק פעיל:

* אין לאפשר מעבר Route באמצעות Navigation.
* ניתן להסתיר את ה־Navigation או להציג אותו במצב Disabled.

יציאה ממשחק תתבצע רק דרך:

```text
סיים משחק
```

---

# 40. End Game Confirmation

לחיצה על "סיים משחק" תציג Modal או Dialog.

טקסט:

```text
האם אתה בטוח שברצונך לסיים את המשחק?
```

פעולות:

```text
ביטול
סיים משחק
```

אישור:

* מפסיק את Game Loop.
* מנקה את ה־Game State הפעיל.
* אינו שומר Statistics.
* מעביר למסך הראשי.

---

# 41. Game HUD

במהלך המשחק יש להציג UI שאינו חלק מה־Canvas עבור:

* ניקוד.
* חיים.
* שלב.
* מספר אויבים שנותרו.
* Sound Toggle.
* סיים משחק.

ה־HUD צריך להיות קריא גם ב־Mobile.

אין לאפשר ל־HUD להסתיר חלק משמעותי מאזור המשחק.

---

# 42. Assets

יש לשמור Assets באופן מקומי בפרויקט.

נדרשים לפחות:

```text
Game Logo
Cannon Image
Small Enemy Image
Medium Enemy Image
Large Enemy Image
Explosion Animation
Background Music
Laser Sound
Enemy Explosion Sound
Cannon Explosion Sound
PWA Icons
```

אין להסתמך על Remote Assets בזמן משחק.

---

# 43. Enemy Visuals

האויבים יהיו יצורים מהחלל בעיצוב:

* מצחיק.
* צבעוני.
* לא מפחיד.
* מתאים לילדים בגילאי 6–12.

שלושת הסוגים יהיו דומים מבחינת השפה הגרפית אך בעלי גודל שונה.

---

# 44. Background

הרקע יהיה:

```text
חלל אפל עם כוכבים
```

הרקע יהיה סטטי.

אין צורך ב:

* Parallax.
* Star Movement.
* Dynamic Background.

---

# 45. Explosion Animation

כאשר Enemy נהרס יש להפעיל Explosion Animation קצרה.

לאחר סיום האנימציה ניתן להסיר את האובייקט באופן מלא.

ניתן לממש באמצעות:

* Sprite Sheet.
* Sequence Animation.

יש להימנע מיצירת DOM Element עבור כל פיצוץ.

---

# 46. PWA Requirements

האפליקציה צריכה להיות Installable PWA.

נדרש:

* Web App Manifest.
* App Name.
* Short Name.
* Icons.
* Theme Color.
* Start URL.
* Standalone Display Mode.
* Service Worker.

שם האפליקציה:

```text
Space Shooter
```

אין להוסיף כפתור Install ייעודי בתוך הממשק.

---

# 47. Offline Support

ה־Service Worker צריך לבצע Cache של כל הקבצים הדרושים להפעלת המשחק.

לאחר שהאפליקציה נטענה ונשמרו הקבצים הדרושים, היא צריכה להיות מסוגלת לפעול ללא אינטרנט.

יש לבצע Cache לפחות עבור:

* JavaScript Bundles.
* CSS.
* HTML.
* Images.
* Audio.
* Icons.
* Fonts מקומיים, אם קיימים.

אין לבצע Runtime Dependency על API חיצוני.

---

# 48. Error Handling

יש לטפל בצורה בטוחה במקרים שבהם localStorage אינו מכיל מידע תקין.

לדוגמה:

אם Statistics אינם קיימים:

```ts
[]
```

אם `soundMuted` אינו קיים:

```ts
false
```

אם JSON השמור ב־localStorage פגום, אין לגרום ל־Application Crash.

יש לחזור לערכי Default תקינים.

---

# 49. localStorage Service

אין לבצע קריאות ישירות ל־localStorage מכל Component.

יש ליצור Service מרכזי.

לדוגמה:

```ts
getStatistics()
saveGameResult()
getSoundMuted()
setSoundMuted()
```

---

# 50. State Management

אין צורך ב־Redux עבור MVP אלא אם במהלך המימוש מתברר שקיימת הצדקה ממשית לכך.

יש להעדיף:

* React State.
* Context כאשר נדרש.
* Game State פנימי של Game Engine.

יש להימנע מהכנסת State Management Library ללא צורך.

---

# 51. Separation Between React and Game Engine

Game Engine אינו צריך להיות תלוי ישירות ב־React.

React צריך להיות מסוגל:

```text
Start Game
Stop Game
Receive Game Status Updates
Receive Score Updates
Receive Lives Updates
Receive Level Updates
```

ה־Game Engine יהיה אחראי על:

```text
Movement
Spawning
Collision
Projectiles
Enemies
Levels
Game Rules
Rendering
```

---

# 52. Game Engine Lifecycle

Game Engine צריך לספק לפחות פעולות עקרוניות כגון:

```ts
start()
stop()
destroy()
restartLevel()
resize()
shoot(x, y)
```

בעת יציאה ממסך המשחק יש לבצע Cleanup מלא.

---

# 53. Cleanup

בעת סיום Game Component יש לוודא:

* ביטול `requestAnimationFrame`.
* הסרת Event Listeners.
* עצירת Timers אם קיימים.
* ניקוי References.
* עצירת Game Engine.

אין להשאיר Game Loop פעיל לאחר מעבר למסך אחר.

---

# 54. Performance Principles

אין דרישת FPS מספרית רשמית ב־PRD, אך יש לבנות את מנגנון המשחק באופן יעיל.

יש:

* להשתמש ב־Canvas ולא ב־DOM עבור Entities.
* להסיר Enemy שאינם פעילים.
* להסיר Projectile שאינם פעילים.
* לא לבצע React Re-render בכל Frame.
* לא לשמור את מיקום כל Entity ב־React State.

React State ישמש עבור מידע ברמת UI בלבד.

---

# 55. Accessibility and Touch Targets

למרות שמדובר במשחק, רכיבי UI רגילים צריכים להיות נגישים ככל שניתן.

יש להבטיח:

* Buttons בגודל נוח ללחיצה.
* Contrast ברור.
* Font קריא.
* Focus State לרכיבי Navigation ב־Desktop.
* `aria-label` לאייקון Sound כאשר אין טקסט לידו.

---

# 56. Browser Support

יש לתמוך בגרסאות מודרניות של:

```text
Google Chrome
Microsoft Edge
```

אין דרישה מפורשת לתמיכה ב:

```text
Firefox
Safari
Internet Explorer
```

---

# 57. No Backend

אין לבצע:

```text
HTTP API
REST API
GraphQL
WebSocket
Authentication Server
Database Connection
Cloud Database
```

כל הנתונים הדרושים למשחק נמצאים מקומית.

---

# 58. No Authentication

אין:

* Sign Up.
* Login.
* Password.
* User Account.
* OAuth.
* Session.
* JWT.

---

# 59. Privacy

האפליקציה אינה אוספת מידע אישי.

אין:

* Analytics.
* Tracking.
* Cookies לצורכי Tracking.
* User Identification.
* Remote Logging.

הנתונים הנשמרים ב־localStorage שייכים למכשיר ול־Browser המקומי בלבד.

---

# 60. Testing Requirements

יש לבדוק לפחות את התרחישים הבאים:

### Game Logic

* התחלת משחק חדש.
* ירייה על Enemy קטן.
* ירייה פעמיים על Enemy בינוני.
* ירייה שלוש פעמים על Enemy גדול.
* פגיעה ב־Enemy שאינו יעד הלחיצה המקורי.
* ירייה לשטח ריק.
* חיסול Enemy.
* עדכון Score.
* השלמת Level.
* מעבר אוטומטי ל־Level הבא.
* איבוד חיים.
* Restart של Level.
* שמירת Score לאחר איבוד חיים.
* הפסד לאחר 3 פגיעות.
* ניצחון לאחר Level 10.

### Statistics

* שמירת Win.
* שמירת Loss.
* אי-שמירת משחק שהופסק ידנית.
* סדר משחקים מהחדש לישן.
* הצגת מצב ללא Statistics.

### Audio

* Mute.
* Unmute.
* Persistence של Mute לאחר Refresh.

### Responsive

* Desktop.
* Mobile Portrait.
* Mobile Landscape.
* שינוי Orientation בזמן משחק.

### PWA

* התקנת PWA.
* פתיחת PWA.
* משחק Offline.

---

# 61. Build Quality

הפרויקט צריך:

* לעבור TypeScript Type Checking ללא Errors.
* להימנע מ־`any` כאשר ניתן להגדיר Type ברור.
* לא להכיל Console Errors בזמן שימוש רגיל.
* לא להכיל Dead Code משמעותי.
* לא להכיל Event Listeners שאינם מנוקים.
* לא להכיל Game Loops שממשיכים לפעול לאחר סיום משחק.

---

# 62. Coding Guidelines

יש להעדיף:

* Components קטנים וברורים.
* Functions בעלות אחריות מוגדרת.
* TypeScript Types ברורים.
* Constants במקום Magic Numbers.
* Game Configuration מרכזי.
* Separation of Concerns.

ערכים כגון:

```text
Projectile Speed
Explosion Duration
Level Complete Delay
Enemy Speeds
Spawn Intervals
```

צריכים להיות מוגדרים ב־Configuration ולא מפוזרים כ־Magic Numbers בקוד.

---

# 63. Suggested Game Configuration

מומלץ ליצור קובץ:

```text
gameConfig.ts
```

שיכלול בין היתר:

```ts
export const GAME_CONFIG = {
  maxLives: 3,
  totalLevels: 10,

  projectileSpeed: 900,

  levelCompleteDelayMs: 1200,
  cannonExplosionDurationMs: 800,

  enemyTypes: {
    small: {
      hitPoints: 1,
      score: 1
    },

    medium: {
      hitPoints: 2,
      score: 2
    },

    large: {
      hitPoints: 3,
      score: 3
    }
  }
};
```

הערכים המדויקים של Speed ו־Timing ניתנים לכוונון במהלך הפיתוח.

---

# 64. Definition of Done

המימוש ייחשב מוכן כאשר:

1. ניתן לפתוח את האפליקציה ב־Chrome וב־Edge.
2. ניתן להתחיל משחק חדש.
3. המשחק מתחיל בשלב 1 עם 3 חיים ו־0 נקודות.
4. התותח מכוון לפי Click או Touch.
5. קליעי לייזר נעים באופן חזותי אל היעד.
6. Collision Detection פועל.
7. שלושת סוגי האויבים דורשים 1, 2 ו־3 פגיעות בהתאמה.
8. מערכת הניקוד פועלת.
9. האויבים נוצרים בהדרגה.
10. הקושי עולה בין השלבים.
11. כל 10 השלבים עובדים.
12. איבוד חיים מפעיל פיצוץ ומתחיל מחדש את אותו Level.
13. Score נשמר לאחר איבוד חיים.
14. לאחר איבוד 3 חיים מתקבל Loss.
15. לאחר השלמת Level 10 מתקבל Win.
16. Win ו־Loss נשמרים ב־localStorage.
17. משחק שהופסק ידנית אינו נשמר.
18. מסך Statistics מציג את הנתונים הנכונים.
19. Sound Toggle עובד ונשמר.
20. האפליקציה Responsive.
21. המשחק עובד ב־Mobile Portrait וב־Mobile Landscape.
22. שינוי Orientation בזמן המשחק אינו מאפס את Score, Lives או Level.
23. האפליקציה ניתנת להתקנה כ־PWA.
24. המשחק עובד Offline.
25. אין תלות ב־Backend או Database.

---

# 65. Implementation Priority

סדר מימוש מומלץ:

```text
1. Project Setup
2. Routing + בסיס המסכים
3. Game Canvas
4. Cannon
5. Input Handling
6. Projectile System
7. Enemy System
8. Collision Detection
9. Score
10. Lives
11. Levels
12. Win / Loss
13. Game Over Screen
14. Statistics + localStorage
15. Audio
16. Responsive Mobile
17. Orientation Handling
18. PWA
19. Offline Support
20. Polish + Animations + Final QA
```

---

# 66. Relationship to PRD

מסמך זה אינו מחליף את מסמך ה־PRD.

במקרה של סתירה:

1. דרישות המוצר וההתנהגות שהוגדרו ב־PRD הן המקור הקובע מבחינה פונקציונלית.
2. מסמך זה הוא המקור הקובע לגבי מבנה המימוש הטכני, כל עוד אינו סותר את ה־PRD.
3. אם דרישה טכנית אינה מוגדרת בשני המסמכים, יש לבחור בפתרון הפשוט ביותר שמתאים ל־MVP.
4. אין להוסיף Features חדשים שלא הוגדרו ב־PRD ללא צורך טכני ברור.

---

