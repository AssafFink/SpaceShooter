import { getStatistics } from '../services/storageService';
import './StatisticsPage.css';

/** Formats an ISO date string as a short, human-friendly he-IL date (no time). */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Statistics screen — spec/PRD.md §4.15.
 *
 * Milestone 6: reads the game history from localStorage via
 * `storageService` (ARCHITECTURE §29), and shows the most recent game first
 * (§27). The screen is view-only — no deleting or editing.
 */
export function StatisticsPage() {
  const results = getStatistics();
  const hasResults = results.length > 0;
  // Newest first — storageService appends in save order (oldest first).
  const rows = [...results].reverse();

  return (
    <div className="page">
      <h1 className="page__title">סטטיסטיקות</h1>

      {hasResults ? (
        <div className="panel statistics-page__table-wrapper">
          <table className="statistics-page__table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>ניקוד</th>
                <th>שלב</th>
                <th>תוצאה</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((result) => (
                <tr key={result.id}>
                  <td>{formatDate(result.date)}</td>
                  <td>{result.finalScore}</td>
                  <td>{result.levelReached}</td>
                  <td>
                    <span
                      className={`statistics-page__result statistics-page__result--${result.result}`}
                    >
                      {result.result === 'win' ? 'ניצחון' : 'הפסד'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="panel statistics-page__empty">עדיין אין משחקים קודמים להצגה</p>
      )}
    </div>
  );
}
