import { GAME_CONFIG } from './gameConfig';
import type { Cannon } from './Cannon';
import type { GameBounds, Projectile } from '../types/game';

const { background: bgConfig, colors, cannon: cannonConfig } = GAME_CONFIG;

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

/** יוצר מערך כוכבים סטטי חדש, מפוזר על פני מידות אזור המשחק הנתונות. */
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
 * כל הציור לאזור המשחק — רקע, כוכבים, תותח, קליעים.
 * מקור: spec/ARCHITECTURE.md §6, §44.
 *
 * אין כאן State פנימי מעבר למה שמועבר כפרמטר — כך שהוספת drawEnemies() וכו'
 * ב-Milestone 3 לא תדרוש שינוי בחתימות הקיימות.
 */
export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
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

    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    // הספרייט מצויר "עומד" כלפי מעלה; angle = -π/2 פירושו ללא סיבוב נוסף.
    ctx.rotate(cannon.angle + Math.PI / 2);

    // גוף התותח — משולש עתידני עם Glow סגול (DESIGN.md: "תותח לייזר עתידני").
    ctx.shadowColor = colors.cannonAccent;
    ctx.shadowBlur = 12;
    ctx.fillStyle = colors.cannonBody;
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.closePath();
    ctx.fill();

    // קנה התותח — פס טורקיז מגוף התותח ועד נקודת יציאת הקליע (muzzleOffset
    // נמדד מהמרכז; ה-rotate() כבר יישר את "מעלה" המקומי לכיוון הכיוונון האמיתי).
    const barrelWidth = 8;
    const barrelLength = cannonConfig.muzzleOffset - height / 2;
    ctx.shadowBlur = 8;
    ctx.fillStyle = colors.cannonAccent;
    ctx.fillRect(-barrelWidth / 2, -cannonConfig.muzzleOffset, barrelWidth, barrelLength);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawProjectiles(projectiles: readonly Projectile[]): void {
    const { ctx } = this;
    const { radius, trailLength } = GAME_CONFIG.projectile;

    for (const projectile of projectiles) {
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
