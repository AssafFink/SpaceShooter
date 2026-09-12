import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { GameCanvas } from '../components/game-ui/GameCanvas';
import { GameHud } from '../components/game-ui/GameHud';
import { useGameEngine } from '../hooks/useGameEngine';
import { ROUTES } from '../types/navigation';
import './GamePage.css';

/**
 * מסך המשחק — spec/PRD.md §4.3.
 *
 * Milestone 3 (Enemies & Combat): אויבים, Collision, ניקוד ו-HUD אמיתי מחוברים.
 * useGameEngine נקרא כאן (ולא ב-GameCanvas) כי ה-HUD (React, מחוץ ל-Canvas,
 * ARCHITECTURE §41) זקוק לאותם נתוני stats שהמנוע מפרסם.
 *
 * חיים ושלב עדיין placeholder קבוע — Milestone 4.
 * ה-Dialog "האם אתה בטוח שברצונך לסיים את המשחק?" מגיע ב-Milestone 5.
 */
export function GamePage() {
  const navigate = useNavigate();
  const { containerRef, canvasRef, stats } = useGameEngine();

  return (
    <div className="game-page">
      <GameHud score={stats.score} enemiesRemaining={stats.enemiesRemaining} />

      <GameCanvas containerRef={containerRef} canvasRef={canvasRef} />

      <Button variant="danger" onClick={() => navigate(ROUTES.home)}>
        סיים משחק
      </Button>
    </div>
  );
}
