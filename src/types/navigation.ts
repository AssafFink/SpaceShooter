/**
 * נתיבי האפליקציה ופריטי תפריט הניווט.
 * מקור: spec/ARCHITECTURE.md §4 (Routing), §38 (Navigation).
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
  /** תווית לתפריט */
  label: string;
  /** נתיב הניווט */
  path: string;
}

/**
 * פריטי תפריט הניווט הראשי (זמינים כאשר אין משחק פעיל).
 * ARCHITECTURE §38: ראשי, סטטיסטיקות, איך לשחק, אודות.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'ראשי', path: ROUTES.home },
  { label: 'סטטיסטיקות', path: ROUTES.statistics },
  { label: 'איך לשחק', path: ROUTES.howToPlay },
  { label: 'אודות', path: ROUTES.about },
];
