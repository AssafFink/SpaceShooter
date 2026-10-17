import type { LevelConfig } from '../types/game';

/**
 * Central Game Configuration — Milestone 2+3+4.
 * Source: spec/ARCHITECTURE.md §62 (Constants instead of Magic Numbers), §63
 * (Suggested Game Configuration), §18 (Level Configuration).
 */
export const GAME_CONFIG = {
  /** Max delta per frame (seconds) — prevents a large "jump" after an inactive Tab. */
  maxDeltaSeconds: 0.05,

  /** ARCHITECTURE §63, §9. */
  maxLives: 3,
  totalLevels: 10,

  /** Duration "Level X complete" is shown before the automatic transition (ARCHITECTURE §20, §63). */
  levelCompleteDelaySeconds: 1.2,
  /** Duration of the cannon explosion animation before Restart/Loss (ARCHITECTURE §21, §63). */
  cannonExplosionDurationSeconds: 0.8,
  /** Delay before the first enemy of each level, so the player has time to get ready. */
  firstSpawnDelaySeconds: 0.8,

  projectile: {
    /** Projectile speed, pixels per second (ARCHITECTURE §63). */
    speed: 900,
    /** Radius of the glowing circle at the projectile's head, in px. */
    radius: 4,
    /** Length of the glow trail behind the projectile, in px. */
    trailLength: 18,
    /** Cap on simultaneously active projectiles — a performance safeguard, not an ammo limit (PRD §4.4). */
    maxActive: 40,
  },

  cannon: {
    width: 54,
    height: 64,
    /** Distance from the rotation center to the muzzle tip — where the projectile exits. */
    muzzleOffset: 34,
    /** Distance between the cannon's bottom and the game area's bottom edge. */
    bottomMargin: 12,
    /** Valid rotation range: the upper half only (enemies only arrive from above). */
    minAngle: -Math.PI,
    maxAngle: 0,
    /** How fast the angle "snaps" toward the target, per second. */
    rotationLerp: 18,
    /** Radius of the cannon's hit area for enemy–cannon collision (ARCHITECTURE §21). */
    hitRadius: 30,
  },

  background: {
    starCount: 120,
    starMinRadius: 0.6,
    starMaxRadius: 1.8,
    starMinAlpha: 0.35,
    starMaxAlpha: 0.95,
  },

  /** ARCHITECTURE §15 — Hit Points and score by size only (PRD §4.6). */
  enemyTypes: {
    small: { hitPoints: 1, score: 1, radius: 15 },
    medium: { hitPoints: 2, score: 2, radius: 22 },
    large: { hitPoints: 3, score: 3, radius: 30 },
    /** Blue creature (added post-MVP): the toughest, slightly larger than large. */
    huge: { hitPoints: 4, score: 4, radius: 32 },
  },

  enemy: {
    /** Forgiveness margin added to the hit radius beyond the drawn radius — a game for kids 6-12. */
    hitRadiusBonus: 3,
    /** Duration of the "hit but not destroyed" flash (seconds) — visual feedback, Milestone 7. */
    hitFlashDurationSeconds: 0.14,
    /** Minimum margin from the screen edge at the Spawn position, in px. */
    spawnMarginX: 24,
    /** Maximum angular deviation from the straight line to the cannon, in radians (~9°, ARCHITECTURE §16). */
    maxAimJitter: 0.16,
    /**
     * Margin below the bottom edge beyond which an enemy is removed
     * silently — the case of an enemy that missed the cannon and exited to
     * the side (ARCHITECTURE §16; see spec/plans/milestone-4.md §1 decision 1).
     */
    despawnMarginY: 60,
    /**
     * Reference game-area height (px) that `enemySpeedScale()` normalizes
     * against, plus the clamp range for the resulting multiplier — so a
     * short Landscape screen isn't far harder than the same level in
     * Portrait (Milestone 9, spec/plans/milestone-9.md §1 F6, §4).
     */
    referenceHeight: 640,
    speedScaleMin: 0.5,
    speedScaleMax: 1.2,
    /** Extra margin beyond the cannon+enemy hit radii kept clear on resize (F3). */
    resizeSafetyMargin: 20,
  },

  explosion: {
    durationSeconds: 0.45,
    /** Multiplier between the enemy's radius and the explosion's peak radius. */
    radiusMultiplier: 2.2,
    ringWidth: 4,
    sparkCount: 8,
  },

  /** The cannon explosion reuses the Explosion entity, at a larger peak size (ARCHITECTURE §45). */
  cannonExplosion: {
    maxRadius: 90,
  },

  /**
   * Explosion SFX are synthesized via the Web Audio API (Milestone 7).
   * Source: spec/ARCHITECTURE.md §30-33; decision origin
   * spec/plans/milestone-7.md §1.1. The laser SFX and the looping background
   * music are audio files (see `laser.src` / `music.src`) — see the addendum
   * in milestone-7.md for why that original "synthesized only" decision was
   * revisited. Volumes are in the 0..1 range; muting happens through
   * masterGain (§32 — no Volume Slider and no separate music/effects control
   * in the UI).
   */
  audio: {
    masterVolume: 0.6,
    musicVolume: 1.0,
    sfxVolume: 0.55,
    /**
     * Laser sound: a short one-shot file, played through sfxGain per shot.
     * Prefixed with Vite's BASE_URL so it resolves under the deploy path
     * (e.g. /SpaceShooter/audio/... on GitHub Pages, /audio/... in dev).
     */
    laser: { src: `${import.meta.env.BASE_URL}audio/laser.mp3` },
    /** Enemy explosion: a noise burst through a Lowpass filter; duration grows slightly with size. */
    enemyExplosion: {
      filterFreq: 1500,
      small: 0.18,
      medium: 0.24,
      large: 0.32,
      huge: 0.38,
    },
    /** Cannon explosion: a large noise burst + a low thump. */
    cannonExplosion: { durationSeconds: 0.6, filterFreq: 800, thumpFreq: 72 },
    /** Looping background music file (§31), played through musicGain. */
    music: {
      // BASE_URL prefix — see the laser note above.
      src: `${import.meta.env.BASE_URL}audio/background-music.mp3`,
    },
  },

  /**
   * Colors duplicated from spec/DESIGN.md (Style Guide) — Canvas can't
   * consume CSS Variables directly, so this duplication is intentional. The
   * source of truth remains DESIGN.md.
   */
  colors: {
    background: '#0B1026',
    star: '#F8FAFF',
    cannonBody: '#9B5CFF',
    cannonAccent: '#00E5FF',
    projectile: '#FF6BFF',
    projectileGlow: '#9B5CFF',
    // Fallback colors matching the Sprites extracted from style-guide.png
    // (Milestone 7): green=small, pink=medium, yellow=large, blue=huge. Used
    // only if the Sprite fails to load.
    enemySmall: '#4CD964',
    enemyMedium: '#FF4D6D',
    enemyLarge: '#FFC83D',
    enemyHuge: '#2E9BFF',
    enemyEye: '#0B1026',
    enemyEyeSpark: '#F8FAFF',
    explosionCore: '#FFC83D',
    explosionRing: '#FF8A3D',
    explosionSpark: '#9B5CFF',
  },
} as const;

/**
 * Definition of the 10 levels — ARCHITECTURE §18. Every field is a
 * **range**; the actual values are rolled from it at the start of every
 * level (EnemySpawner.reset, ARCHITECTURE §19), so the same level looks
 * slightly different between games but stays at the same difficulty.
 *
 * Difficulty rises gradually along four axes at once (PRD §4.9): more
 * enemies, shorter Spawn intervals, higher speed, and more medium/large
 * enemies. The values are a starting point for kids 6-12 (PRD §4.9, §5) —
 * fine-tuned in Milestone 9 (spec/plans/milestone-9.md §4).
 *
 * Enemy types unlock one per level (post-MVP): level 1 green only, level 2
 * adds pink, level 3 adds yellow, and from level 4 all four — including the
 * blue "huge" enemy — can appear. Once unlocked, frequency always ranks
 * small > medium > large > huge. Speeds are ~12% above the MVP tuning; the
 * child-friendly ceilings in tests/levels.test.ts still hold.
 */
export const LEVELS: readonly LevelConfig[] = [
  { level: 1, enemyCountMin: 4, enemyCountMax: 6, spawnIntervalMinSeconds: 1.6, spawnIntervalMaxSeconds: 2.4, enemySpeedMin: 34, enemySpeedMax: 50, smallProbability: 1, mediumProbability: 0, largeProbability: 0, hugeProbability: 0 },
  { level: 2, enemyCountMin: 5, enemyCountMax: 7, spawnIntervalMinSeconds: 1.5, spawnIntervalMaxSeconds: 2.2, enemySpeedMin: 36, enemySpeedMax: 54, smallProbability: 0.7, mediumProbability: 0.3, largeProbability: 0, hugeProbability: 0 },
  { level: 3, enemyCountMin: 6, enemyCountMax: 9, spawnIntervalMinSeconds: 1.4, spawnIntervalMaxSeconds: 2.1, enemySpeedMin: 39, enemySpeedMax: 58, smallProbability: 0.55, mediumProbability: 0.3, largeProbability: 0.15, hugeProbability: 0 },
  { level: 4, enemyCountMin: 8, enemyCountMax: 11, spawnIntervalMinSeconds: 1.3, spawnIntervalMaxSeconds: 1.9, enemySpeedMin: 43, enemySpeedMax: 63, smallProbability: 0.5, mediumProbability: 0.26, largeProbability: 0.16, hugeProbability: 0.08 },
  { level: 5, enemyCountMin: 9, enemyCountMax: 13, spawnIntervalMinSeconds: 1.2, spawnIntervalMaxSeconds: 1.8, enemySpeedMin: 47, enemySpeedMax: 67, smallProbability: 0.48, mediumProbability: 0.26, largeProbability: 0.16, hugeProbability: 0.1 },
  { level: 6, enemyCountMin: 11, enemyCountMax: 15, spawnIntervalMinSeconds: 1.1, spawnIntervalMaxSeconds: 1.7, enemySpeedMin: 50, enemySpeedMax: 73, smallProbability: 0.46, mediumProbability: 0.27, largeProbability: 0.16, hugeProbability: 0.11 },
  { level: 7, enemyCountMin: 12, enemyCountMax: 17, spawnIntervalMinSeconds: 1.0, spawnIntervalMaxSeconds: 1.6, enemySpeedMin: 54, enemySpeedMax: 78, smallProbability: 0.44, mediumProbability: 0.27, largeProbability: 0.17, hugeProbability: 0.12 },
  { level: 8, enemyCountMin: 14, enemyCountMax: 19, spawnIntervalMinSeconds: 1.0, spawnIntervalMaxSeconds: 1.5, enemySpeedMin: 58, enemySpeedMax: 84, smallProbability: 0.42, mediumProbability: 0.28, largeProbability: 0.17, hugeProbability: 0.13 },
  { level: 9, enemyCountMin: 15, enemyCountMax: 20, spawnIntervalMinSeconds: 0.95, spawnIntervalMaxSeconds: 1.45, enemySpeedMin: 62, enemySpeedMax: 90, smallProbability: 0.41, mediumProbability: 0.28, largeProbability: 0.18, hugeProbability: 0.13 },
  { level: 10, enemyCountMin: 17, enemyCountMax: 22, spawnIntervalMinSeconds: 0.9, spawnIntervalMaxSeconds: 1.4, enemySpeedMin: 67, enemySpeedMax: 98, smallProbability: 0.4, mediumProbability: 0.28, largeProbability: 0.18, hugeProbability: 0.14 },
];
