import { GAME_CONFIG } from '../game/gameConfig';
import type { EnemySize } from '../types/game';

/**
 * Central Web Audio service — Milestone 7. Source: spec/ARCHITECTURE.md §30-33;
 * decision in spec/plans/milestone-7.md §1.1 (synthesized audio, no files).
 *
 * All sound — laser, explosions and the looping background music — is
 * synthesized at runtime, so the game has zero remote/audio-file dependencies
 * and is Offline-ready for M8. No component touches Web Audio directly (§30):
 * the game engine emits events, `useAudio` drives mute/unlock, and both go
 * through this single module.
 *
 * Graph: master → destination, with music/sfx sub-gains under master. Mute
 * (§32, no volume slider) ramps master to 0. Autoplay policy (§31): the
 * AudioContext is created and resumed only on the first user interaction, via
 * `unlock()`. If Web Audio is unavailable every function is a safe no-op — the
 * game never crashes over sound (mirrors storageService's defensive style).
 */

const cfg = GAME_CONFIG.audio;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let muted = false;

// Background-music scheduler state (lookahead scheduling on the audio clock).
let musicTimer: number | null = null;
let musicStep = 0;
let nextStepTime = 0;
const LOOKAHEAD_SECONDS = 0.2;
const SCHEDULER_INTERVAL_MS = 50;

/** Lazily create the AudioContext + gain graph. Returns null if unsupported. */
function ensure(): AudioContext | null {
  if (ctx) return ctx;
  try {
    if (typeof AudioContext === 'undefined') return null;
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = muted ? 0 : cfg.masterVolume;
    master.connect(context.destination);

    const music = context.createGain();
    music.gain.value = cfg.musicVolume;
    music.connect(master);

    const sfx = context.createGain();
    sfx.gain.value = cfg.sfxVolume;
    sfx.connect(master);

    ctx = context;
    masterGain = master;
    musicGain = music;
    sfxGain = sfx;
  } catch {
    ctx = null;
  }
  return ctx;
}

/** A short tone with a quick attack/decay envelope into a target gain node. */
function playTone(
  context: AudioContext,
  destination: GainNode,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  peak: number,
): void {
  const osc = context.createOscillator();
  const env = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  env.gain.setValueAtTime(0.0001, startTime);
  env.gain.exponentialRampToValueAtTime(peak, startTime + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(env).connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    env.disconnect();
  };
}

/** A filtered, decaying noise burst — the basis of both explosion sounds. */
function noiseBurst(duration: number, filterFreq: number, peak: number): void {
  const context = ensure();
  if (!context || !sfxGain) return;
  const t = context.currentTime;
  const frames = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    // White noise with a linear decay envelope baked into the samples.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const env = context.createGain();
  env.gain.value = peak;

  source.connect(filter).connect(env).connect(sfxGain);
  source.start(t);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    env.disconnect();
  };
}

/** Schedules one step of the looping bass + arpeggio pattern. */
function scheduleStep(stepTime: number): void {
  if (!ctx || !musicGain) return;
  const { bass, arp, stepSeconds } = cfg.music;
  playTone(ctx, musicGain, bass[musicStep % bass.length], stepTime, stepSeconds * 0.95, 'triangle', 0.6);
  playTone(ctx, musicGain, arp[musicStep % arp.length], stepTime, stepSeconds * 0.6, 'sawtooth', 0.22);
  musicStep += 1;
}

/** Lookahead scheduler: queues notes slightly ahead of the audio clock. */
function schedulerTick(): void {
  if (!ctx) return;
  while (nextStepTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
    scheduleStep(nextStepTime);
    nextStepTime += cfg.music.stepSeconds;
  }
}

function startMusic(): void {
  const context = ensure();
  if (!context || musicTimer !== null) return;
  musicStep = 0;
  nextStepTime = context.currentTime + 0.1;
  schedulerTick();
  musicTimer = window.setInterval(schedulerTick, SCHEDULER_INTERVAL_MS);
}

function stopMusic(): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export const audioService = {
  /** Resume audio after the first user gesture and start music if unmuted (§31). */
  unlock(): void {
    const context = ensure();
    if (!context) return;
    if (context.state === 'suspended') void context.resume();
    if (!muted) startMusic();
  },

  /** Mute/unmute everything together (§32). Ramps master gain; toggles music. */
  setMuted(value: boolean): void {
    muted = value;
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(value ? 0 : cfg.masterVolume, ctx.currentTime, 0.02);
    }
    if (value) {
      stopMusic();
    } else if (ctx) {
      startMusic();
    }
  },

  playLaser(): void {
    const context = ensure();
    if (!context || !sfxGain) return;
    const t = context.currentTime;
    const osc = context.createOscillator();
    const env = context.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(cfg.laser.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.laser.endFreq, t + cfg.laser.durationSeconds);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.9, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + cfg.laser.durationSeconds);
    osc.connect(env).connect(sfxGain);
    osc.start(t);
    osc.stop(t + cfg.laser.durationSeconds + 0.02);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  },

  playEnemyExplosion(size: EnemySize): void {
    noiseBurst(cfg.enemyExplosion[size], cfg.enemyExplosion.filterFreq, 0.8);
  },

  playCannonExplosion(): void {
    const { durationSeconds, filterFreq, thumpFreq } = cfg.cannonExplosion;
    noiseBurst(durationSeconds, filterFreq, 1);

    // Low sine "thump" under the noise for weight.
    const context = ensure();
    if (!context || !sfxGain) return;
    const t = context.currentTime;
    const osc = context.createOscillator();
    const env = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(thumpFreq * 2, t);
    osc.frequency.exponentialRampToValueAtTime(thumpFreq, t + 0.3);
    env.gain.setValueAtTime(0.9, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + durationSeconds);
    osc.connect(env).connect(sfxGain);
    osc.start(t);
    osc.stop(t + durationSeconds + 0.02);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  },
};
