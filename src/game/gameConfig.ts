/**
 * Game Configuration מרכזי — Milestone 2 (Core Game Prototype).
 * מקור: spec/ARCHITECTURE.md §62 (Constants במקום Magic Numbers), §63 (Suggested
 * Game Configuration).
 *
 * שדות של Milestones מאוחרים (maxLives, totalLevels, enemyTypes, levels...)
 * ייווספו באותם Milestones עצמם — אין להוסיף כאן שדות שאין להם עדיין שימוש
 * (ARCHITECTURE §61: אין Dead Code משמעותי).
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
  },
} as const;
