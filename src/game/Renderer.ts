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

  /**
   * מצייר Sprite ממורכז ב-(cx, cy) בגובה `targetHeight` (שומר יחס רוחב/גובה),
   * מסובב ב-`angle` רדיאנים (ברירת מחדל 0). מחזיר `false` אם ה-Sprite עדיין
   * לא מוכן — כדי שהקורא יפול חזרה לציור הווקטורי (Sprite-first, Vector-fallback).
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

    // Sprite-first: התותח הגזור מ-style-guide.png מצויר "עומד" (קנה כלפי מעלה),
    // ולכן אותה נוסחת סיבוב של הווקטור (angle + π/2) מיישרת אותו לכיוון הכיוונון.
    if (this.drawSpriteCentered('cannon', cannon.x, cannon.y, height * 1.2, cannon.angle + Math.PI / 2)) {
      return;
    }

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

  /**
   * מצייר יצור חלל מצחיק וידידותי: כיפה עגולה + "רגליים" מסולסלות + שתי עיניים.
   * מקור: spec/DESIGN.md ("יצורי חלל מצחיקים וצבעוניים"), ARCHITECTURE §43.
   * שלושת הסוגים חולקים את אותה פונקציית ציור — נבדלים בגודל ובצבע בלבד (§15).
   */
  drawEnemies(enemies: readonly Enemy[]): void {
    const { ctx } = this;

    for (const enemy of enemies) {
      const radius = getEnemyRadius(enemy.size);
      const flashAlpha =
        enemy.hitFlashSeconds > 0
          ? enemy.hitFlashSeconds / GAME_CONFIG.enemy.hitFlashDurationSeconds
          : 0;

      // Sprite-first: היצור הגזור מ-style-guide.png. הגובה המצויר יחסי לרדיוס
      // כדי שהתחושה החזותית תתאים לרדיוס הפגיעה (Milestone 7).
      const spriteHeight = radius * 2.5;
      if (this.drawSpriteCentered(ENEMY_SPRITE[enemy.size], enemy.x, enemy.y, spriteHeight)) {
        if (flashAlpha > 0) {
          // הבזק "נפגע אך לא חוסל": ציור חוזר של אותו Sprite ב-lighter מבהיר
          // אותו לעבר לבן, בלי לצייר צורה נוספת (spec/PRD §UX).
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = flashAlpha * 0.85;
          this.drawSpriteCentered(ENEMY_SPRITE[enemy.size], enemy.x, enemy.y, spriteHeight);
          ctx.restore();
        }
        continue;
      }

      // --- Fallback ווקטורי (אם ה-Sprite לא נטען) ---
      const bodyColor = ENEMY_BODY_COLOR[enemy.size];

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // רגליים מסולסלות מתחת לגוף — נותנות אופי של יצור ולא של כדור.
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

      // גוף — כיפה עגולה עם Glow עדין בצבע הסוג.
      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // שתי עיניים גדולות וידידותיות עם ברק.
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

      // הבזק "נפגע אך לא חוסל" גם ב-Fallback הווקטורי.
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
   * מצייר אנימציית פיצוץ: טבעת מתרחבת + גרעין דוהה + ניצוצות מתפזרים.
   * מקור: spec/ARCHITECTURE.md §45.
   */
  drawExplosions(explosions: readonly Explosion[]): void {
    const { ctx } = this;

    for (const explosion of explosions) {
      const progress = Math.min(1, explosion.elapsedSeconds / explosion.durationSeconds);

      // Sprite-first: תמונת פיצוץ בודדת מ-style-guide.png, מונפשת ע"י גדילה
      // (scale) ודהייה (alpha) לאורך חיי הפיצוץ (ARCHITECTURE §45 — single still).
      if (isReady(EXPLOSION_SPRITE[explosion.variant])) {
        const diameter = explosion.maxRadius * 2 * (0.55 + progress * 0.75);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress * progress);
        this.drawSpriteCentered(EXPLOSION_SPRITE[explosion.variant], explosion.x, explosion.y, diameter);
        ctx.restore();
        continue;
      }

      // --- Fallback ווקטורי ---
      const radius = explosion.maxRadius * progress;
      const alpha = 1 - progress;

      ctx.save();
      ctx.translate(explosion.x, explosion.y);
      ctx.globalAlpha = alpha;

      // גרעין דוהה במרכז.
      ctx.fillStyle = colors.explosionCore;
      ctx.beginPath();
      ctx.arc(0, 0, explosion.maxRadius * 0.35 * (1 - progress * 0.6), 0, Math.PI * 2);
      ctx.fill();

      // טבעת מתרחבת.
      ctx.strokeStyle = colors.explosionRing;
      ctx.lineWidth = explosionConfig.ringWidth;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // ניצוצות מתפזרים — זווית קבועה לפי אינדקס כדי שלא "ירצדו" בין פריימים.
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
      // Sprite-first: הבולט הגזור מ-style-guide.png, מסובב לכיוון התנועה
      // (הספרייט מצויר אנכית → up=-y → סיבוב ב-angle + π/2, כמו התותח).
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
