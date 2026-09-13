import type { LevelConfig } from '../types/game';

/**
 * Game Configuration מרכזי — Milestone 2+3+4.
 * מקור: spec/ARCHITECTURE.md §62 (Constants במקום Magic Numbers), §63 (Suggested
 * Game Configuration), §18 (Level Configuration).
 */
export const GAME_CONFIG = {
  /** Delta מקסימלי לפריים (שניות) — מונע "קפיצה" גדולה אחרי Tab לא פעיל. */
  maxDeltaSeconds: 0.05,

  /** ARCHITECTURE §63, §9. */
  maxLives: 3,
  totalLevels: 10,

  /** משך הצגת "שלב X הושלם" לפני מעבר אוטומטי (ARCHITECTURE §20, §63). */
  levelCompleteDelaySeconds: 1.2,
  /** משך אנימציית פיצוץ התותח לפני Restart/Loss (ARCHITECTURE §21, §63). */
  cannonExplosionDurationSeconds: 0.8,
  /** השהיה לפני האויב הראשון של כל שלב, כדי שהשחקן יספיק להתמקם. */
  firstSpawnDelaySeconds: 0.8,

  projectile: {
    /** מהירות קליע, פיקסלים לשנייה (ARCHITECTURE §63). */
    speed: 900,
    /** רדיוס העיגול הזוהר בראש הקליע, ב-px. */
    radius: 4,
    /** אורך שובל הזוהר מאחורי הקליע, ב-px. */
    trailLength: 18,
    /** מגבלת קליעים פעילים בו-זמנית — הגנת ביצועים, לא מגבלת תחמושת (PRD §4.4). */
    maxActive: 40,
  },

  cannon: {
    width: 54,
    height: 64,
    /** מרחק ממרכז הסיבוב לקצה הקנה — משם יוצא הקליע. */
    muzzleOffset: 34,
    /** מרחק בין תחתית התותח לתחתית אזור המשחק. */
    bottomMargin: 12,
    /** טווח סיבוב חוקי: החצי העליון בלבד (אויבים מגיעים רק מלמעלה). */
    minAngle: -Math.PI,
    maxAngle: 0,
    /** מהירות "היצמדות" הזווית לכיוון היעד, ליחידת שנייה. */
    rotationLerp: 18,
    /** רדיוס אזור הפגיעה של התותח לצורך התנגשות אויב–תותח (ARCHITECTURE §21). */
    hitRadius: 30,
  },

  background: {
    starCount: 120,
    starMinRadius: 0.6,
    starMaxRadius: 1.8,
    starMinAlpha: 0.35,
    starMaxAlpha: 0.95,
  },

  /** ARCHITECTURE §15 — Hit Points וניקוד לפי גודל בלבד (PRD §4.6). */
  enemyTypes: {
    small: { hitPoints: 1, score: 1, radius: 15 },
    medium: { hitPoints: 2, score: 2, radius: 22 },
    large: { hitPoints: 3, score: 3, radius: 30 },
  },

  enemy: {
    /** תוספת סלחנות לרדיוס הפגיעה מעבר לרדיוס המצויר — משחק לילדים 6-12. */
    hitRadiusBonus: 3,
    /** משך הבזק "נפגע אך לא חוסל" (שניות) — משוב חזותי, Milestone 7. */
    hitFlashDurationSeconds: 0.14,
    /** שוליים מינימליים מקצה המסך במיקום ה-Spawn, ב-px. */
    spawnMarginX: 24,
    /** סטייה זוויתית מקסימלית מהקו הישר אל התותח, ברדיאנים (~9°, ARCHITECTURE §16). */
    maxAimJitter: 0.16,
    /**
     * שוליים מתחת לגבול התחתון שאחריהם אויב מוסר בשקט — מקרה של אויב שהחמיץ
     * את התותח ויצא בצד (ARCHITECTURE §16; ראו spec/plans/milestone-4.md §1 החלטה 1).
     */
    despawnMarginY: 60,
  },

  explosion: {
    durationSeconds: 0.45,
    /** מכפיל בין רדיוס האויב לרדיוס השיא של הפיצוץ. */
    radiusMultiplier: 2.2,
    ringWidth: 4,
    sparkCount: 8,
  },

  /** פיצוץ התותח משתמש חוזר בישות Explosion, בגודל שיא גדול יותר (ARCHITECTURE §45). */
  cannonExplosion: {
    maxRadius: 90,
  },

  /**
   * אודיו מסונתז ב-Web Audio API (Milestone 7) — אין קבצים חיצוניים.
   * מקור: spec/ARCHITECTURE.md §30-33; החלטת מקור מ-spec/plans/milestone-7.md §1.1.
   * העוצמות בטווח 0..1; ההשתקה מבוצעת דרך masterGain (§32 — אין Volume Slider
   * ואין שליטה נפרדת מוזיקה/אפקטים ב-UI).
   */
  audio: {
    masterVolume: 0.6,
    musicVolume: 0.32,
    sfxVolume: 0.55,
    /** צליל ירי: Sweep יורד מהיר (ARCHITECTURE §UX — משוב מיידי). */
    laser: { startFreq: 840, endFreq: 190, durationSeconds: 0.13 },
    /** פיצוץ אויב: פרץ רעש דרך Lowpass; משך גדל מעט לפי גודל. */
    enemyExplosion: {
      filterFreq: 1500,
      small: 0.18,
      medium: 0.24,
      large: 0.32,
    },
    /** פיצוץ תותח: פרץ רעש גדול + thump נמוך. */
    cannonExplosion: { durationSeconds: 0.6, filterFreq: 800, thumpFreq: 72 },
    /**
     * מוזיקת רקע מסונתזת בלולאה (§31). ה-Scheduler ב-audioService מתזמן צעד
     * אחד בכל stepSeconds; הרצף חוזר על עצמו. tempo צנוע ולא צורם לילדים.
     */
    music: {
      stepSeconds: 0.32,
      /** תדרי הבס (Hz), צעד אחד לכל תו — סולם מינורי, לופ קצר. */
      bass: [55, 55, 82.41, 65.41],
      /** ארפג'יו מעל הבס (Hz). */
      arp: [220, 261.63, 329.63, 261.63, 220, 329.63, 392, 329.63],
    },
  },

  /**
   * צבעים המשוכפלים מ-spec/DESIGN.md (Style Guide) — Canvas אינו יכול לצרוך
   * CSS Variables ישירות, ולכן הכפילות כאן מכוונת. מקור האמת נשאר DESIGN.md.
   */
  colors: {
    background: '#0B1026',
    star: '#F8FAFF',
    cannonBody: '#9B5CFF',
    cannonAccent: '#00E5FF',
    projectile: '#FF6BFF',
    projectileGlow: '#9B5CFF',
    // צבעי fallback תואמים ל-Sprites הגזורים מ-style-guide.png (Milestone 7):
    // ירוק=small, ורוד=medium, צהוב=large. משמשים רק אם ה-Sprite לא נטען.
    enemySmall: '#4CD964',
    enemyMedium: '#FF4D6D',
    enemyLarge: '#FFC83D',
    enemyEye: '#0B1026',
    enemyEyeSpark: '#F8FAFF',
    explosionCore: '#FFC83D',
    explosionRing: '#FF8A3D',
    explosionSpark: '#9B5CFF',
  },
} as const;

/**
 * הגדרת 10 השלבים — ARCHITECTURE §18. כל שדה הוא **טווח**; הערכים בפועל
 * מוגרלים בתוכו בכל תחילת שלב (EnemySpawner.reset, ARCHITECTURE §19), כך
 * שאותו שלב נראה שונה מעט בין משחקים אך נשאר באותה רמת קושי.
 *
 * הקושי עולה בהדרגה בארבעה צירים במקביל (PRD §4.9): יותר אויבים, מרווחי
 * Spawn קצרים יותר, מהירות גבוהה יותר ויותר אויבים בינוניים/גדולים. הערכים
 * הם נקודת פתיחה לילדים 6-12 (PRD §4.9, §5) — כיוונון מדויק ב-Milestone 9.
 */
export const LEVELS: readonly LevelConfig[] = [
  { level: 1, enemyCountMin: 4, enemyCountMax: 6, spawnIntervalMinSeconds: 1.6, spawnIntervalMaxSeconds: 2.4, enemySpeedMin: 30, enemySpeedMax: 45, smallProbability: 0.7, mediumProbability: 0.25, largeProbability: 0.05 },
  { level: 2, enemyCountMin: 5, enemyCountMax: 7, spawnIntervalMinSeconds: 1.5, spawnIntervalMaxSeconds: 2.2, enemySpeedMin: 32, enemySpeedMax: 48, smallProbability: 0.65, mediumProbability: 0.28, largeProbability: 0.07 },
  { level: 3, enemyCountMin: 6, enemyCountMax: 9, spawnIntervalMinSeconds: 1.4, spawnIntervalMaxSeconds: 2.1, enemySpeedMin: 35, enemySpeedMax: 52, smallProbability: 0.6, mediumProbability: 0.3, largeProbability: 0.1 },
  { level: 4, enemyCountMin: 8, enemyCountMax: 11, spawnIntervalMinSeconds: 1.3, spawnIntervalMaxSeconds: 1.9, enemySpeedMin: 38, enemySpeedMax: 56, smallProbability: 0.55, mediumProbability: 0.32, largeProbability: 0.13 },
  { level: 5, enemyCountMin: 9, enemyCountMax: 13, spawnIntervalMinSeconds: 1.2, spawnIntervalMaxSeconds: 1.8, enemySpeedMin: 42, enemySpeedMax: 60, smallProbability: 0.5, mediumProbability: 0.35, largeProbability: 0.15 },
  { level: 6, enemyCountMin: 11, enemyCountMax: 15, spawnIntervalMinSeconds: 1.1, spawnIntervalMaxSeconds: 1.7, enemySpeedMin: 45, enemySpeedMax: 65, smallProbability: 0.45, mediumProbability: 0.37, largeProbability: 0.18 },
  { level: 7, enemyCountMin: 12, enemyCountMax: 17, spawnIntervalMinSeconds: 1.0, spawnIntervalMaxSeconds: 1.6, enemySpeedMin: 48, enemySpeedMax: 70, smallProbability: 0.4, mediumProbability: 0.38, largeProbability: 0.22 },
  { level: 8, enemyCountMin: 14, enemyCountMax: 19, spawnIntervalMinSeconds: 0.9, spawnIntervalMaxSeconds: 1.5, enemySpeedMin: 52, enemySpeedMax: 75, smallProbability: 0.35, mediumProbability: 0.4, largeProbability: 0.25 },
  { level: 9, enemyCountMin: 16, enemyCountMax: 21, spawnIntervalMinSeconds: 0.8, spawnIntervalMaxSeconds: 1.4, enemySpeedMin: 55, enemySpeedMax: 80, smallProbability: 0.32, mediumProbability: 0.4, largeProbability: 0.28 },
  { level: 10, enemyCountMin: 18, enemyCountMax: 24, spawnIntervalMinSeconds: 0.7, spawnIntervalMaxSeconds: 1.3, enemySpeedMin: 60, enemySpeedMax: 88, smallProbability: 0.3, mediumProbability: 0.4, largeProbability: 0.3 },
];
