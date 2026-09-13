import { GAME_CONFIG } from '../game/gameConfig';
import type { EnemySize } from '../types/game';

/**
 * Central Web Audio service — Milestone 7. Source: spec/ARCHITECTURE.md §30-33;
 * decision in spec/plans/milestone-7.md §1.1 (synthesized SFX); see that
 * plan's addendum for why background music was later switched to a file.
 *
 * Explosion SFX are synthesized at runtime. The laser SFX is a short audio
 * file, decoded once into an AudioBuffer and played through a fresh
 * BufferSource per shot so rapid fire can overlap. Background music is a
 * looping audio file (`cfg.music.src`), routed into the same gain graph via a
 * MediaElementAudioSourceNode. All three go through the same sfx/music gains,
 * so mute and volume behave identically. No component touches Web Audio
 * directly (§30): the game engine emits events, `useAudio` drives mute/unlock,
 * and both go through this single module.
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

// Background-music element, wired into musicGain the first time it's needed.
// The MediaElementAudioSourceNode can only be created once per <audio>
// element, so the element itself is cached here for the lifetime of the
// page; the source node needs no JS reference once connected — the Web
// Audio graph keeps it alive as long as the connection stands.
let musicElement: HTMLAudioElement | null = null;

// Laser SFX buffer, decoded lazily on first unlock and reused for every shot.
// null until the fetch+decode resolves; playLaser is a no-op until then, so
// the first shot or two may be silent while it loads (a few ms in practice).
let laserBuffer: AudioBuffer | null = null;

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

/** Lazily creates the <audio> element and routes it into musicGain. */
function ensureMusicElement(context: AudioContext): HTMLAudioElement | null {
  if (musicElement) return musicElement;
  if (!musicGain) return null;
  try {
    const element = new Audio(cfg.music.src);
    element.loop = true;
    element.preload = 'auto';
    context.createMediaElementSource(element).connect(musicGain);
    musicElement = element;
  } catch {
    musicElement = null;
  }
  return musicElement;
}

function startMusic(): void {
  const context = ensure();
  if (!context) return;
  const element = ensureMusicElement(context);
  if (!element) return;
  void element.play().catch(() => {
    // Autoplay was blocked (e.g. gesture requirement not yet satisfied) —
    // the next unlock()/setMuted(false) call will retry.
  });
}

function stopMusic(): void {
  musicElement?.pause();
}

/** Fetches and decodes the laser SFX once; safe to call repeatedly. */
function loadLaserBuffer(context: AudioContext): void {
  if (laserBuffer) return;
  fetch(cfg.laser.src)
    .then((res) => res.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      laserBuffer = buffer;
    })
    .catch(() => {
      // Load/decode failed — playLaser stays a silent no-op, game unaffected.
    });
}

export const audioService = {
  /** Resume audio after the first user gesture and start music if unmuted (§31). */
  unlock(): void {
    const context = ensure();
    if (!context) return;
    if (context.state === 'suspended') void context.resume();
    loadLaserBuffer(context);
    if (!muted) startMusic();
  },

  /**
   * Suspends the AudioContext and pauses the music element (e.g. tab/app
   * moved to the background) so nothing keeps playing while the game itself
   * is frozen (rAF is paused). No-op if audio was never unlocked. Milestone
   * 9, spec/plans/milestone-9.md §1 (F7).
   */
  suspend(): void {
    if (ctx && ctx.state === 'running') void ctx.suspend();
    musicElement?.pause();
  },

  /** Resumes the AudioContext and music after `suspend()`, unless muted. */
  resume(): void {
    if (ctx && ctx.state === 'suspended') void ctx.resume();
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
    if (!context || !sfxGain || !laserBuffer) return;
    const source = context.createBufferSource();
    source.buffer = laserBuffer;
    source.connect(sfxGain);
    source.start(context.currentTime);
    source.onended = () => source.disconnect();
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
