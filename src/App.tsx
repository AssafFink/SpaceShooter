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
 * App root: App Shell (Navigation) + Routing.
 * Source: spec/ARCHITECTURE.md §4.
 *
 * Blocking navigation during an active game (PRD §4.2, ARCHITECTURE §39) —
 * Milestone 5: `Navigation` is hidden entirely on the `/game` route only.
 * That route is only entered via "Start"/"New Game" and only left via "End
 * Game" (→ `/`) or win/loss (→ `/game-over`) — so `pathname === '/game'` is
 * an exact proxy for "active game". On `/game-over` (not an active game)
 * Navigation is shown, so the user isn't trapped.
 */
function App() {
  const location = useLocation();
  const isActiveGame = location.pathname === ROUTES.game;

  // The app's audio layer (Milestone 7): syncs Mute with SoundContext and
  // starts background music after the first interaction. Cross-screen, composed once.
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
