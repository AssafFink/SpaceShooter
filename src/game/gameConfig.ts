/**
 * Game Configuration מרכזי — Milestone 2+3 (Core Game Prototype, Enemies & Combat).
 * מקור: spec/ARCHITECTURE.md §62 (Constants במקום Magic Numbers), §63 (Suggested
 * Game Configuration).
 *
 * שדות של Milestones מאוחרים (maxLives, totalLevels, levels...) ייווספו באותם
 * Milestones עצמם — אין להוסיף כאן שדות שאין להם עדיין שימוש (ARCHITECTURE §61).
 *
 * `prototypeWave` הוא גל אויבים זמני ל-Milestone 3 בלבד — ב-Milestone 4 הוא
 * יוחלף ב-`LEVELS[10]` (Level Configuration), ראו spec/plans/milestone-3.md §15.
 */
export const GAME_CONFIG = {
  /** Delta מקסימלי לפריים (שניות) — מונע "קפיצה" גדולה אחרי Tab לא פעיל. */
  maxDeltaSeconds: 0.05,

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
    /** שוליים מינימליים מקצה המסך במיקום ה-Spawn, ב-px. */
    spawnMarginX: 24,
    /** סטייה זוויתית מקסימלית מהקו הישר אל התותח, ברדיאנים (~9°, ARCHITECTURE §16). */
    maxAimJitter: 0.16,
    /** שוליים מתחת לגבול התחתון שאחריהם האויב מוסר (Milestone 3 בלבד). */
    despawnMarginY: 60,
  },

  /**
   * גל Prototype ל-Milestone 3 בלבד. ב-Milestone 4 יוחלף ב-LEVELS[]
   * (Level Configuration ל-10 שלבים, ARCHITECTURE §18) — ואז יש להסיר בלוק זה.
   */
  prototypeWave: {
    enemyCount: 12,
    spawnIntervalMinSeconds: 1.0,
    spawnIntervalMaxSeconds: 2.0,
    /** השהיה לפני האויב הראשון, כדי שהשחקן יספיק להתמקם. */
    firstSpawnDelaySeconds: 0.8,
    speedMin: 30,
    speedMax: 55,
    /** סכום ההסתברויות = 1 (ARCHITECTURE §17, §19). */
    smallProbability: 0.5,
    mediumProbability: 0.35,
    largeProbability: 0.15,
  },

  explosion: {
    durationSeconds: 0.45,
    /** מכפיל בין רדיוס האויב לרדיוס השיא של הפיצוץ. */
    radiusMultiplier: 2.2,
    ringWidth: 4,
    sparkCount: 8,
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
    enemySmall: '#4CD964',
    enemyMedium: '#00E5FF',
    enemyLarge: '#9B5CFF',
    enemyEye: '#0B1026',
    enemyEyeSpark: '#F8FAFF',
    explosionCore: '#FFC83D',
    explosionRing: '#FF8A3D',
    explosionSpark: '#9B5CFF',
  },
} as const;
