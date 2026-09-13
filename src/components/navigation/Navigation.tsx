import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SoundToggle } from '../common/SoundToggle';
import { NAV_ITEMS } from '../../types/navigation';
import './Navigation.css';

/**
 * Main navigation menu.
 * Desktop: a regular nav bar. Mobile: Hamburger Menu.
 * Source: spec/ARCHITECTURE.md §38, spec/DESIGN.md.
 *
 * Hidden entirely during an active game (App.tsx, Milestone 5) — PRD §4.2, ARCHITECTURE §39.
 * Includes the shared SoundToggle (spec/PRD.md §4.18) — the same state is shown in GameHud too.
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

        {/* Desktop menu */}
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

          {/* Hamburger button — Mobile only */}
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

      {/* Mobile menu panel */}
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
