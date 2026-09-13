import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAudio } from './hooks/useAudio';
import { Navigation } from './components/navigation/Navigation';
import { AboutPage } from './pages/AboutPage';
import { GameOverPage } from './pages/GameOverPage';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { ROUTES } from './types/navigation';

/**
 * שורש האפליקציה: App Shell (Navigation) + Routing.
 * מקור: spec/ARCHITECTURE.md §4.
 *
 * חסימת ניווט בזמן משחק פעיל (PRD §4.2, ARCHITECTURE §39) — Milestone 5:
 * ה-`Navigation` מוסתר לחלוטין בנתיב `/game` בלבד. הנתיב הזה נכנס רק דרך
 * "התחל"/"משחק חדש" ונעזב רק דרך "סיים משחק" (→ `/`) או win/loss
 * (→ `/game-over`) — לכן `pathname === '/game'` הוא Proxy מדויק ל"משחק פעיל".
 * ב-`/game-over` (אינו משחק פעיל) ה-Navigation מוצג, כדי לא לכלוא את המשתמש.
 */
function App() {
  const location = useLocation();
  const isActiveGame = location.pathname === ROUTES.game;

  // שכבת האודיו של האפליקציה (Milestone 7): מסנכרנת Mute עם SoundContext
  // ומתחילה מוזיקת רקע אחרי האינטראקציה הראשונה. חוצת-מסכים, מורכבת פעם אחת.
  useAudio();

  return (
    <>
      {!isActiveGame && <Navigation />}
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.game} element={<GamePage />} />
        <Route path={ROUTES.statistics} element={<StatisticsPage />} />
        <Route path={ROUTES.howToPlay} element={<HowToPlayPage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        <Route path={ROUTES.gameOver} element={<GameOverPage />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </>
  );
}

export default App;
