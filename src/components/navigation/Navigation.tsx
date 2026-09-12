import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../types/navigation';
import './Navigation.css';

/**
 * תפריט ניווט ראשי.
 * Desktop: שורת ניווט רגילה. Mobile: Hamburger Menu.
 * מקור: spec/ARCHITECTURE.md §38, spec/DESIGN.md.
 *
 * הערה: חסימת הניווט בזמן משחק פעיל (PRD §4.2, ARCHITECTURE §39)
 * ממומשת ב-Milestone 5 — לא בגרסה זו.
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
