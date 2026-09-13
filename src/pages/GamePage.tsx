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
 * מסך המשחק — spec/PRD.md §4.3.
 *
 * Milestone 5: כפתור "סיים משחק" פותח Confirmation Dialog (PRD §4.14, Flow 7)
 * ומקפיא את המשחק (`pause()`) כל עוד הוא פתוח — "ביטול" ממשיך (`resume()`),
 * "אישור" מנווט ל-`/` בלי לשמור. הניווט חסום בזמן משחק פעיל דרך הסתרת
 * ה-Navigation ב-`App.tsx`.
 *
 * Milestone 6: בעת win/loss נשמרת תוצאת המשחק ב-localStorage (PRD Flows 5-6,
 * ARCHITECTURE §28) **לפני** הניווט ל-`/game-over`. `savedRef` מבטיח שמירה
 * פעם אחת בדיוק לכל משחק, כולל תחת React StrictMode. סיום יזום (Flow 7)
 * ממשיך לנווט ל-`/` בלי לגעת ב-Service כלל — אינו נשמר.
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
