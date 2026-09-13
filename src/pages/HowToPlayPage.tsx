import './HowToPlayPage.css';

interface EnemySizeInfo {
  icon: string;
  label: string;
  hits: string;
  className: string;
}

/** The three enemy sizes — a visual Placeholder (Emoji); real Assets in Milestone 7. */
const ENEMY_SIZES: EnemySizeInfo[] = [
  { icon: '👾', label: 'קטן', hits: 'פגיעה 1', className: 'enemy-sizes__item--small' },
  { icon: '👾', label: 'בינוני', hits: '2 פגיעות', className: 'enemy-sizes__item--medium' },
  { icon: '👾', label: 'גדול', hits: '3 פגיעות', className: 'enemy-sizes__item--large' },
];

/**
 * "How to Play" screen — spec/PRD.md §4.16, spec/DESIGN.md (Mockup "How to Play").
 * A short explanation: game objective, how to play (including the three
 * enemy sizes), lives, level transition, loss.
 */
export function HowToPlayPage() {
  return (
    <div className="page">
      <h1 className="page__title">איך לשחק</h1>
      <div className="how-to-play-page__sections">
        <section className="panel how-to-play-page__section">
          <span className="how-to-play-page__icon" aria-hidden="true">
            🎯
          </span>
          <div>
            <h2>מטרת המשחק</h2>
            <p>להשמיד את כל האויבים, לצבור ניקוד ולעבור את כל 10 השלבים.</p>
          </div>
        </section>

        <section className="panel how-to-play-page__section">
          <span className="how-to-play-page__icon" aria-hidden="true">
            👆
          </span>
          <div>
            <h2>איך משחקים</h2>
            <p>לוחצים או נוגעים באויב כדי לירות עליו.</p>
            <div className="enemy-sizes">
              {ENEMY_SIZES.map((enemy) => (
                <div key={enemy.label} className={`enemy-sizes__item ${enemy.className}`}>
                  <span className="enemy-sizes__icon" aria-hidden="true">
                    {enemy.icon}
                  </span>
                  <span className="enemy-sizes__label">{enemy.label}</span>
                  <span className="enemy-sizes__hits">{enemy.hits}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel how-to-play-page__section">
          <span className="how-to-play-page__icon" aria-hidden="true">
            ❤️
          </span>
          <div>
            <h2>חיים</h2>
            <p>יש לכם 3 חיים לכל המשחק. בכל פגיעה מאבדים חיים אחד.</p>
          </div>
        </section>

        <section className="panel how-to-play-page__section">
          <span className="how-to-play-page__icon" aria-hidden="true">
            📈
          </span>
          <div>
            <h2>מעבר שלב</h2>
            <p>לאחר השמדת כל האויבים בשלב, עוברים אוטומטית לשלב הבא.</p>
          </div>
        </section>

        <section className="panel how-to-play-page__section">
          <span className="how-to-play-page__icon" aria-hidden="true">
            💀
          </span>
          <div>
            <h2>הפסד</h2>
            <p>המשחק מסתיים כשמאבדים את כל 3 החיים.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
