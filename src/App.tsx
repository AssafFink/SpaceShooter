import { Navigate, Route, Routes } from 'react-router-dom';
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
 * הערה: חסימת ניווט בזמן משחק פעיל (PRD §4.2) ממומשת ב-Milestone 5.
 */
function App() {
  return (
    <>
      <Navigation />
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
