import './StatisticsPage.css';

/**
 * מסך סטטיסטיקות — spec/PRD.md §4.15.
 *
 * ב-Milestone 1 זהו שלד בלבד: כותרת + מבנה טבלה + מצב "אין נתונים".
 * קריאה בפועל מ-localStorage מגיעה ב-Milestone 6.
 */
export function StatisticsPage() {
  const hasResults = false; // placeholder — ייקרא מ-localStorage ב-Milestone 6

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
            <tbody>{/* שורות הנתונים יתווספו ב-Milestone 6 */}</tbody>
          </table>
        </div>
      ) : (
        <p className="panel statistics-page__empty">עדיין אין משחקים קודמים להצגה</p>
      )}
    </div>
  );
}
