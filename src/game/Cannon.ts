import { GAME_CONFIG } from './gameConfig';
import type { GameBounds, Vector2 } from '../types/game';

const { cannon: config } = GAME_CONFIG;
const TWO_PI = Math.PI * 2;

/** מנרמל זווית לטווח (-π, π]. */
function normalizeAngle(angle: number): number {
  let result = angle % TWO_PI;
  if (result > Math.PI) result -= TWO_PI;
  if (result < -Math.PI) result += TWO_PI;
  return result;
}

/** ההפרש הקצר ביותר בין שתי זוויות (בטווח (-π, π]). */
function shortestAngleDelta(from: number, to: number): number {
  return normalizeAngle(to - from);
}

/**
 * התותח: מיקום קבוע בתחתית אזור המשחק, מסתובב לכיוון נקודת הלחיצה.
 * מקור: spec/ARCHITECTURE.md §10.
 */
export class Cannon {
  x = 0;
  y = 0;
  /** הזווית המצוירת בפועל (רדיאנים; -π/2 = כלפי מעלה). */
  angle = -Math.PI / 2;
  private targetAngle = -Math.PI / 2;

  /** מיקום מחדש לפי מידות אזור המשחק החדשות (למשל אחרי Resize). */
  setBounds(bounds: GameBounds): void {
    this.x = bounds.width / 2;
    this.y = bounds.height - config.bottomMargin - config.height / 2;
  }

  /** חישוב הזווית הרצויה לעבר נקודת יעד, מוגבלת לחצי העליון (§10, §1 בתוכנית). */
  aimAt(target: Vector2): void {
    const rawAngle = Math.atan2(target.y - this.y, target.x - this.x);
    this.targetAngle = Math.min(config.maxAngle, Math.max(config.minAngle, rawAngle));
  }

  /** הנעת הזווית המצוירת לעבר היעד, בדרך הקצרה ביותר. */
  update(deltaSeconds: number): void {
    if (config.rotationLerp <= 0) {
      this.angle = this.targetAngle;
      return;
    }
    const delta = shortestAngleDelta(this.angle, this.targetAngle);
    const maxStep = config.rotationLerp * deltaSeconds;
    if (Math.abs(delta) <= maxStep) {
      this.angle = this.targetAngle;
    } else {
      this.angle = normalizeAngle(this.angle + Math.sign(delta) * maxStep);
    }
  }

  /** נקודת קצה הקנה — משם יוצא הקליע. */
  getMuzzlePosition(): Vector2 {
    return {
      x: this.x + Math.cos(this.angle) * config.muzzleOffset,
      y: this.y + Math.sin(this.angle) * config.muzzleOffset,
    };
  }
}
