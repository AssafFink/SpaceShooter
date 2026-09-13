import { SoundToggle } from '../common/SoundToggle';
import './GameHud.css';

interface GameHudProps {
  score: number;
  lives: number;
  currentLevel: number;
  enemiesRemaining: number;
}

interface HudStatProps {
  icon: string;
  label: string;
  value: number;
  className?: string;
}

function HudStat({ icon, label, value, className }: HudStatProps) {
  const classes = ['game-hud__stat', className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      <span className="game-hud__stat-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="game-hud__stat-body">
        <span className="game-hud__stat-label">{label}</span>
        <span className="game-hud__stat-value">{value}</span>
      </span>
    </span>
  );
}

/**
 * HUD for the game screen — spec/PRD.md §4.3, spec/ARCHITECTURE.md §41,
 * spec/DESIGN.md (Mockup "Game"). Milestone 5: styled HUD cards + Sound
 * Toggle (the same `SoundContext` shared with Navigation).
 *
 * The four stats are fed from the engine (GameEngine via useGameEngine) and
 * update in real time. Doesn't hide a significant part of the game area
 * (ARCHITECTURE §41).
 */
export function GameHud({ score, lives, currentLevel, enemiesRemaining }: GameHudProps) {
  return (
    <div className="game-hud">
      <SoundToggle className="game-hud__sound" />
      <div className="game-hud__stats">
        <HudStat icon="👾" label="נותרו" value={enemiesRemaining} className="game-hud__stat--enemies" />
        <HudStat icon="🚀" label="שלב" value={currentLevel} className="game-hud__stat--level" />
        <HudStat icon="❤️" label="חיים" value={lives} className="game-hud__stat--lives" />
        <HudStat icon="⭐" label="ניקוד" value={score} className="game-hud__stat--score" />
      </div>
    </div>
  );
}
