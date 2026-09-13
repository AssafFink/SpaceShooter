import { GAME_CONFIG } from './gameConfig';
import type { GameBounds, Vector2 } from '../types/game';

const { cannon: config } = GAME_CONFIG;
const TWO_PI = Math.PI * 2;

/** Normalizes an angle into the (-π, π] range. */
function normalizeAngle(angle: number): number {
  let result = angle % TWO_PI;
  if (result > Math.PI) result -= TWO_PI;
  if (result < -Math.PI) result += TWO_PI;
  return result;
}

/** The shortest difference between two angles (in the (-π, π] range). */
function shortestAngleDelta(from: number, to: number): number {
  return normalizeAngle(to - from);
}

/**
 * The cannon: fixed position at the bottom of the game area, rotates toward
 * the tap/click point. Source: spec/ARCHITECTURE.md §10.
 */
export class Cannon {
  x = 0;
  y = 0;
  /** The angle actually drawn (radians; -π/2 = pointing up). */
  angle = -Math.PI / 2;
  private targetAngle = -Math.PI / 2;

  /** Repositions for new game-area dimensions (e.g. after a resize). */
  setBounds(bounds: GameBounds): void {
    this.x = bounds.width / 2;
    this.y = bounds.height - config.bottomMargin - config.height / 2;
  }

  /** Computes the desired angle toward a target, clamped to the upper half (§10, plan §1). */
  aimAt(target: Vector2): void {
    const rawAngle = Math.atan2(target.y - this.y, target.x - this.x);
    this.targetAngle = Math.min(config.maxAngle, Math.max(config.minAngle, rawAngle));
  }

  /** Moves the drawn angle toward the target, along the shortest path. */
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

  /** The muzzle tip position — where the projectile is spawned. */
  getMuzzlePosition(): Vector2 {
    return {
      x: this.x + Math.cos(this.angle) * config.muzzleOffset,
      y: this.y + Math.sin(this.angle) * config.muzzleOffset,
    };
  }
}
