import { useEffect, useRef, useState } from 'react';
import './Confetti.css';

/** Style-guide palette (spec/DESIGN.md) — confetti uses the brand colors. */
const COLORS = ['#00E5FF', '#9B5CFF', '#FFC83D', '#FF4D6D', '#4CD964', '#F8FAFF'];

/** How long new pieces keep spawning, then how long until the overlay is removed. */
const EMIT_SECONDS = 2.5;
const MAX_SECONDS = 6;
/** Pieces spawned per second while emitting (halved with reduced motion). */
const EMIT_RATE = 120;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  angle: number;
  spin: number;
  /** Phase for the side-to-side "flutter". */
  wobble: number;
}

function createPiece(width: number): Piece {
  return {
    x: Math.random() * width,
    y: -20,
    vx: (Math.random() - 0.5) * 120,
    vy: 120 + Math.random() * 160,
    size: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 10,
    wobble: Math.random() * Math.PI * 2,
  };
}

/**
 * Full-screen confetti celebration (post-MVP: shown on a win). A fixed,
 * click-through canvas over the whole viewport; pieces rain down for a few
 * seconds and the overlay then removes itself. Self-contained requestAnimationFrame
 * loop, fully cleaned up on unmount.
 */
export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const rate = reducedMotion ? EMIT_RATE / 2 : EMIT_RATE;

    let width = 0;
    let height = 0;
    function resize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const pieces: Piece[] = [];
    let elapsed = 0;
    let toEmit = 0;
    let last = performance.now();
    let frameId = 0;

    function frame(now: number) {
      if (!ctx) return;
      // Clamp delta so a backgrounded tab doesn't teleport every piece.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      if (elapsed < EMIT_SECONDS) {
        toEmit += rate * dt;
        while (toEmit >= 1) {
          pieces.push(createPiece(width));
          toEmit -= 1;
        }
      }

      ctx.clearRect(0, 0, width, height);
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.wobble += dt * 4;
        p.x += (p.vx + Math.sin(p.wobble) * 40) * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        if (p.y > height + 20) {
          pieces.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        // Squash on one axis as it spins, so it reads as a flat paper piece.
        ctx.scale(1, Math.abs(Math.cos(p.wobble)) * 0.8 + 0.2);
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
        ctx.restore();
      }

      const finished = elapsed >= EMIT_SECONDS && pieces.length === 0;
      if (finished || elapsed >= MAX_SECONDS) {
        setDone(true);
        return;
      }
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (done) return null;
  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}
