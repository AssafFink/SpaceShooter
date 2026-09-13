import { GAME_CONFIG } from './gameConfig';
import type { GameBounds, Projectile, Vector2 } from '../types/game';

const { projectile: config } = GAME_CONFIG;

/**
 * Creation and movement of laser projectiles — pure functions, no internal
 * state. Source: spec/ARCHITECTURE.md §12.
 */

/**
 * Creates a new projectile moving from origin toward target (normalized
 * Direction Vector, ARCHITECTURE §12). The projectile doesn't stop at
 * target — it keeps going in that direction until it's out of bounds (no Homing).
 */
export function createProjectile(id: string, origin: Vector2, target: Vector2): Projectile {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const length = Math.hypot(dx, dy);

  // Avoid division by zero when the target equals the origin (a tap right on
  // the muzzle tip) — fires straight "up" in that case.
  const [dirX, dirY] = length === 0 ? [0, -1] : [dx / length, dy / length];

  return {
    id,
    x: origin.x,
    y: origin.y,
    velocityX: dirX * config.speed,
    velocityY: dirY * config.speed,
    active: true,
    prevX: origin.x,
    prevY: origin.y,
  };
}

/**
 * Advances the projectile by its velocity and Delta Time (ARCHITECTURE §7).
 * Keeps the previous position in prevX/prevY — needed for Swept Collision
 * (Milestone 3, see spec/plans/milestone-3.md §3.3).
 */
export function updateProjectile(projectile: Projectile, deltaSeconds: number): void {
  projectile.prevX = projectile.x;
  projectile.prevY = projectile.y;
  projectile.x += projectile.velocityX * deltaSeconds;
  projectile.y += projectile.velocityY * deltaSeconds;
}

/** Checks whether the projectile has left the game area's bounds (including margin for the glow trail). */
export function isOutOfBounds(projectile: Projectile, bounds: GameBounds): boolean {
  const margin = config.radius + config.trailLength;
  return (
    projectile.x < -margin ||
    projectile.x > bounds.width + margin ||
    projectile.y < -margin ||
    projectile.y > bounds.height + margin
  );
}
