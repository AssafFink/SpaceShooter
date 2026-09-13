import { GAME_CONFIG } from './gameConfig';
import { getEnemyRadius } from './Enemy';
import { getSprite, isReady } from './sprites';
import type { SpriteName } from './sprites';
import type { Cannon } from './Cannon';
import type {
  Enemy,
  EnemySize,
  Explosion,
  ExplosionVariant,
  GameBounds,
  Projectile,
} from '../types/game';

const {
  background: bgConfig,
  colors,
  cannon: cannonConfig,
  explosion: explosionConfig,
} = GAME_CONFIG;

const ENEMY_BODY_COLOR: Record<EnemySize, string> = {
  small: colors.enemySmall,
  medium: colors.enemyMedium,
  large: colors.enemyLarge,
};

const ENEMY_SPRITE: Record<EnemySize, SpriteName> = {
  small: 'enemy-small',
  medium: 'enemy-medium',
  large: 'enemy-large',
};

const EXPLOSION_SPRITE: Record<ExplosionVariant, SpriteName> = {
  small: 'explosion-small',
  medium: 'explosion-medium',
  large: 'explosion-large',
  cannon: 'explosion-cannon',
};

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

/** Creates a new static array of stars, scattered across the given game-area dimensions. */
export function createStars(bounds: GameBounds): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < bgConfig.starCount; i++) {
    stars.push({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      radius:
        bgConfig.starMinRadius + Math.random() * (bgConfig.starMaxRadius - bgConfig.starMinRadius),
      alpha:
        bgConfig.starMinAlpha + Math.random() * (bgConfig.starMaxAlpha - bgConfig.starMinAlpha),
    });
  }
  return stars;
}

/**
 * All drawing for the game area — background, stars, cannon, projectiles.
 * Source: spec/ARCHITECTURE.md §6, §44.
 *
 * No internal State beyond what's passed as a parameter — so adding
 * drawEnemies() etc. in Milestone 3 required no change to the existing signatures.
 */
export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Draws a Sprite centered at (cx, cy) at `targetHeight` (preserving
   * aspect ratio), rotated by `angle` radians (default 0). Returns `false`
   * if the Sprite isn't ready yet — so the caller falls back to vector
   * drawing (Sprite-first, Vector-fallback).
   */
  private drawSpriteCentered(
    name: SpriteName,
    cx: number,
    cy: number,
    targetHeight: number,
    angle = 0,
  ): boolean {
    if (!isReady(name)) return false;
    const img = getSprite(name);
    const scale = targetHeight / img.naturalHeight;
    const w = img.naturalWidth * scale;
    const h = targetHeight;

    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);
    if (angle !== 0) ctx.rotate(angle);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  drawBackground(bounds: GameBounds, stars: Star[]): void {
    const { ctx } = this;
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    ctx.fillStyle = colors.star;
    for (const star of stars) {
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawCannon(cannon: Cannon): void {
    const { ctx } = this;
    const { width, height } = cannonConfig;

    // Sprite-first: the cannon cut from style-guide.png is drawn "upright"
    // (barrel pointing up), so the same vector rotation formula (angle + π/2)
    // aligns it with the aim direction.
    if (this.drawSpriteCentered('cannon', cannon.x, cannon.y, height * 1.2, cannon.angle + Math.PI / 2)) {
      return;
    }

    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    // The sprite is drawn "upright"; angle = -π/2 means no additional rotation.
    ctx.rotate(cannon.angle + Math.PI / 2);

    // Cannon body — a futuristic triangle with a purple Glow (DESIGN.md: "futuristic laser cannon").
    ctx.shadowColor = colors.cannonAccent;
    ctx.shadowBlur = 12;
    ctx.fillStyle = colors.cannonBody;
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.closePath();
    ctx.fill();

    // Cannon barrel — a turquoise bar from the body to the muzzle exit point
    // (muzzleOffset is measured from the center; rotate() already aligned
    // local "up" with the real aim direction).
    const barrelWidth = 8;
    const barrelLength = cannonConfig.muzzleOffset - height / 2;
    ctx.shadowBlur = 8;
    ctx.fillStyle = colors.cannonAccent;
    ctx.fillRect(-barrelWidth / 2, -cannonConfig.muzzleOffset, barrelWidth, barrelLength);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /**
   * Draws a friendly, funny space creature: a round dome + curly "legs" +
   * two eyes. Source: spec/DESIGN.md ("funny, colorful space creatures"),
   * ARCHITECTURE §43. All three sizes share the same draw function — they
   * differ only in size and color (§15).
   */
  drawEnemies(enemies: readonly Enemy[]): void {
    const { ctx } = this;

    for (const enemy of enemies) {
      const radius = getEnemyRadius(enemy.size);
      const flashAlpha =
        enemy.hitFlashSeconds > 0
          ? enemy.hitFlashSeconds / GAME_CONFIG.enemy.hitFlashDurationSeconds
          : 0;

      // Sprite-first: the creature cut from style-guide.png. The drawn
      // height is relative to the radius so the visual size matches the
      // hit radius (Milestone 7).
      const spriteHeight = radius * 2.5;
      if (this.drawSpriteCentered(ENEMY_SPRITE[enemy.size], enemy.x, enemy.y, spriteHeight)) {
        if (flashAlpha > 0) {
          // "Hit but not destroyed" flash: redraw the same Sprite with
          // 'lighter' to brighten it toward white, without drawing an extra
          // shape (spec/PRD §UX).
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = flashAlpha * 0.85;
          this.drawSpriteCentered(ENEMY_SPRITE[enemy.size], enemy.x, enemy.y, spriteHeight);
          ctx.restore();
        }
        continue;
      }

      // --- Vector fallback (if the Sprite hasn't loaded) ---
      const bodyColor = ENEMY_BODY_COLOR[enemy.size];

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // Curly legs under the body — give it the character of a creature, not a ball.
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = Math.max(2, radius * 0.15);
      ctx.lineCap = 'round';
      const legCount = 3;
      for (let i = 0; i < legCount; i++) {
        const legX = (radius * 0.7 * (i - (legCount - 1) / 2)) / Math.max(1, legCount - 1);
        ctx.beginPath();
        ctx.moveTo(legX, radius * 0.6);
        ctx.quadraticCurveTo(legX * 1.4, radius * 1.05, legX * 0.6, radius * 1.25);
        ctx.stroke();
      }

      // Body — a round dome with a soft Glow in the type's color.
      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Two big, friendly eyes with a highlight.
      const eyeOffsetX = radius * 0.4;
      const eyeOffsetY = radius * -0.1;
      const eyeRadius = radius * 0.3;
      for (const sign of [-1, 1]) {
        ctx.fillStyle = colors.enemyEye;
        ctx.beginPath();
        ctx.arc(sign * eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.enemyEyeSpark;
        ctx.beginPath();
        ctx.arc(
          sign * eyeOffsetX + eyeRadius * 0.3,
          eyeOffsetY - eyeRadius * 0.3,
          eyeRadius * 0.35,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // "Hit but not destroyed" flash on the vector fallback too.
      if (flashAlpha > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = flashAlpha * 0.7;
        ctx.fillStyle = colors.star;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();
    }
  }

  /**
   * Draws the explosion animation: an expanding ring + a fading core +
   * scattering sparks. Source: spec/ARCHITECTURE.md §45.
   */
  drawExplosions(explosions: readonly Explosion[]): void {
    const { ctx } = this;

    for (const explosion of explosions) {
      const progress = Math.min(1, explosion.elapsedSeconds / explosion.durationSeconds);

      // Sprite-first: a single explosion image from style-guide.png,
      // animated by growing (scale) and fading (alpha) over the explosion's
      // lifetime (ARCHITECTURE §45 — single still).
      if (isReady(EXPLOSION_SPRITE[explosion.variant])) {
        const diameter = explosion.maxRadius * 2 * (0.55 + progress * 0.75);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress * progress);
        this.drawSpriteCentered(EXPLOSION_SPRITE[explosion.variant], explosion.x, explosion.y, diameter);
        ctx.restore();
        continue;
      }

      // --- Vector fallback ---
      const radius = explosion.maxRadius * progress;
      const alpha = 1 - progress;

      ctx.save();
      ctx.translate(explosion.x, explosion.y);
      ctx.globalAlpha = alpha;

      // Fading core at the center.
      ctx.fillStyle = colors.explosionCore;
      ctx.beginPath();
      ctx.arc(0, 0, explosion.maxRadius * 0.35 * (1 - progress * 0.6), 0, Math.PI * 2);
      ctx.fill();

      // Expanding ring.
      ctx.strokeStyle = colors.explosionRing;
      ctx.lineWidth = explosionConfig.ringWidth;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Scattering sparks — a fixed angle per index so they don't "flicker" between frames.
      ctx.fillStyle = colors.explosionSpark;
      for (let i = 0; i < explosionConfig.sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / explosionConfig.sparkCount;
        const sparkDistance = radius * 1.1;
        const sparkX = Math.cos(angle) * sparkDistance;
        const sparkY = Math.sin(angle) * sparkDistance;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, Math.max(1, explosionConfig.ringWidth * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  drawProjectiles(projectiles: readonly Projectile[]): void {
    const { ctx } = this;
    const { radius, trailLength } = GAME_CONFIG.projectile;

    for (const projectile of projectiles) {
      // Sprite-first: the bolt cut from style-guide.png, rotated toward the
      // direction of travel (the sprite is drawn vertically → up=-y →
      // rotation by angle + π/2, same as the cannon).
      if (isReady('laser')) {
        const angle = Math.atan2(projectile.velocityY, projectile.velocityX) + Math.PI / 2;
        this.drawSpriteCentered('laser', projectile.x, projectile.y, trailLength + radius * 3, angle);
        continue;
      }

      const speed = Math.hypot(projectile.velocityX, projectile.velocityY) || 1;
      const dirX = projectile.velocityX / speed;
      const dirY = projectile.velocityY / speed;
      const tailX = projectile.x - dirX * trailLength;
      const tailY = projectile.y - dirY * trailLength;

      const gradient = ctx.createLinearGradient(tailX, tailY, projectile.x, projectile.y);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, colors.projectileGlow);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = radius;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(projectile.x, projectile.y);
      ctx.stroke();

      ctx.shadowColor = colors.projectileGlow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = colors.projectile;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}
