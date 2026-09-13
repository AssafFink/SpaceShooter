import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { GameCanvas } from '../components/game-ui/GameCanvas';
import { ConfirmEndGameDialog } from '../components/game-ui/ConfirmEndGameDialog';
import { GameHud } from '../components/game-ui/GameHud';
import { LevelCompleteMessage } from '../components/game-ui/LevelCompleteMessage';
import { useGameEngine } from '../hooks/useGameEngine';
import { saveGameResult } from '../services/storageService';
import { ROUTES } from '../types/navigation';
import type { GameOverState } from '../types/navigation';
import './GamePage.css';

/**
 * Game screen — spec/PRD.md §4.3.
 *
 * Milestone 5: the "End Game" button opens a Confirmation Dialog (PRD §4.14,
 * Flow 7) and freezes the game (`pause()`) for as long as it's open —
 * "Cancel" resumes (`resume()`), "Confirm" navigates to `/` without saving.
 * Navigation is blocked during an active game by hiding Navigation in `App.tsx`.
 *
 * Milestone 6: on win/loss the game result is saved to localStorage (PRD
 * Flows 5-6, ARCHITECTURE §28) **before** navigating to `/game-over`.
 * `savedRef` guarantees the save happens exactly once per game, including
 * under React StrictMode. A deliberate end (Flow 7) still navigates to `/`
 * without touching the Service at all — it isn't saved.
 */
export function GamePage() {
  const navigate = useNavigate();
  const { containerRef, canvasRef, stats, pause, resume } = useGameEngine();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (stats.status !== 'won' && stats.status !== 'lost') return;

    const result: GameOverState['result'] = stats.status === 'won' ? 'win' : 'loss';

    if (!savedRef.current) {
      savedRef.current = true;
      saveGameResult({
        result,
        finalScore: stats.score,
        levelReached: stats.currentLevel,
      });
    }

    const state: GameOverState = {
      result,
      finalScore: stats.score,
      levelReached: stats.currentLevel,
    };
    navigate(ROUTES.gameOver, { replace: true, state });
  }, [stats.status, stats.score, stats.currentLevel, navigate]);

  function requestEndGame() {
    pause();
    setConfirmOpen(true);
  }

  function cancelEndGame() {
    setConfirmOpen(false);
    resume();
  }

  function confirmEndGame() {
    setConfirmOpen(false);
    navigate(ROUTES.home);
  }

  return (
    <div className="game-page">
      <GameHud
        score={stats.score}
        lives={stats.lives}
        currentLevel={stats.currentLevel}
        enemiesRemaining={stats.enemiesRemaining}
      />

      <div className="game-page__canvas-wrap">
        <GameCanvas containerRef={containerRef} canvasRef={canvasRef} />
        {stats.status === 'level-complete' && (
          <LevelCompleteMessage level={stats.currentLevel} />
        )}
      </div>

      <Button variant="danger" onClick={requestEndGame}>
        סיים משחק
      </Button>

      {confirmOpen && (
        <ConfirmEndGameDialog onCancel={cancelEndGame} onConfirm={confirmEndGame} />
      )}
    </div>
  );
}
