import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { GameCanvas } from '../components/game-ui/GameCanvas';
import { GameHud } from '../components/game-ui/GameHud';
import { LevelCompleteMessage } from '../components/game-ui/LevelCompleteMessage';
import { useGameEngine } from '../hooks/useGameEngine';
import { ROUTES } from '../types/navigation';
import type { GameOverState } from '../types/navigation';
import './GamePage.css';

/**
 * מסך המשחק — spec/PRD.md §4.3.
 *
 * Milestone 4 (Lives, Levels & Game Rules): חיים, שלבים, Restart אחרי פגיעה,
 * הודעת "שלב X הושלם" ומעבר ל-`/game-over` עם Win/Loss אמיתיים.
 *
 * ה-Dialog "האם אתה בטוח שברצונך לסיים את המשחק?" וחסימת הניווט בזמן משחק
 * מגיעים ב-Milestone 5 — כפתור "סיים משחק" עדיין מנווט ישירות ל-`/`.
 */
export function GamePage() {
  const navigate = useNavigate();
  const { containerRef, canvasRef, stats } = useGameEngine();

  useEffect(() => {
    if (stats.status !== 'won' && stats.status !== 'lost') return;

    const state: GameOverState = {
      result: stats.status === 'won' ? 'win' : 'loss',
      finalScore: stats.score,
      levelReached: stats.currentLevel,
    };
    navigate(ROUTES.gameOver, { replace: true, state });
  }, [stats.status, stats.score, stats.currentLevel, navigate]);

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

      <Button variant="danger" onClick={() => navigate(ROUTES.home)}>
        סיים משחק
      </Button>
    </div>
  );
}
