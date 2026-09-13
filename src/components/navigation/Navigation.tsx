import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SoundToggle } from '../common/SoundToggle';
import { NAV_ITEMS } from '../../types/navigation';
import './Navigation.css';

/**
 * תפריט ניווט ראשי.
 * Desktop: שורת ניווט רגילה. Mobile: Hamburger Menu.
 * מקור: spec/ARCHITECTURE.md §38, spec/DESIGN.md.
 *
 * מוסתר לחלוטין בזמן משחק פעיל (App.tsx, Milestone 5) — PRD §4.2, ARCHITECTURE §39.
 * כולל SoundToggle משותף (spec/PRD.md §4.18) — אותו מצב מוצג גם ב-GameHud.
 */
export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="nav">
      <div className="nav__bar">
        <NavLink to="/" className="nav__brand" onClick={closeMenu}>
          Space Shooter
        </NavLink>

        {/* תפריט Desktop */}
        <nav className="nav__links nav__links--desktop" aria-label="ניווט ראשי">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'nav__link' + (isActive ? ' nav__link--active' : '')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <SoundToggle />

          {/* כפתור Hamburger — Mobile בלבד */}
          <button
            type="button"
            className="nav__hamburger"
            aria-label={isOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="nav__hamburger-icon" aria-hidden="true">
              {isOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {/* פאנל תפריט Mobile */}
      {isOpen && (
        <nav className="nav__links nav__links--mobile" aria-label="ניווט ראשי (מובייל)">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'nav__link' + (isActive ? ' nav__link--active' : '')
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
