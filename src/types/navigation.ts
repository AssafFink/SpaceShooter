/**
 * Application routes and navigation menu items.
 * Source: spec/ARCHITECTURE.md §4 (Routing), §38 (Navigation).
 */

export const ROUTES = {
  home: '/',
  game: '/game',
  statistics: '/statistics',
  howToPlay: '/how-to-play',
  about: '/about',
  gameOver: '/game-over',
} as const;

export interface NavItem {
  /** Menu label */
  label: string;
  /** Navigation path */
  path: string;
}

/**
 * The state passed on navigation from `/game` to `/game-over` (Milestone 4).
 * Source: spec/ARCHITECTURE.md §25 (Game Result), §24-25 (Win/Loss).
 *
 * Passed via React Router's `location.state` — not saved to localStorage
 * (saving the result to statistics is Milestone 6).
 */
export interface GameOverState {
  result: 'win' | 'loss';
  finalScore: number;
  levelReached: number;
}

/**
 * Main navigation menu items (available when no game is active).
 * ARCHITECTURE §38: Home, Statistics, How to Play, About.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'ראשי', path: ROUTES.home },
  { label: 'סטטיסטיקות', path: ROUTES.statistics },
  { label: 'איך לשחק', path: ROUTES.howToPlay },
  { label: 'אודות', path: ROUTES.about },
];
