import './HowToPlayPage.css';

interface InfoSection {
  icon: string;
  title: string;
  text: string;
}

/**
 * מסך "איך לשחק" — spec/PRD.md §4.16.
 * הסבר קצר: מטרת המשחק, איך משחקים, שלושת גדלי האויבים, חיים, מעבר שלב, הפסד.
 */
const SECTIONS: InfoSection[] = [
  {
    icon: '🎯',
    title: 'מטרת המשחק',
    text: 'להשמיד את כל האויבים, לצבור ניקוד ולעבור את כל 10 השלבים.',
  },
  {
    icon: '👆',
    title: 'איך משחקים',
    text: 'לוחצים או נוגעים באויב כדי לירות עליו. קטן = פגיעה 1, בינוני = 2 פגיעות, גדול = 3 פגיעות.',
  },
  {
    icon: '❤️',
    title: 'חיים',
    text: 'יש לכם 3 חיים לכל המשחק. בכל פגיעה מאבדים חיים אחד.',
  },
  {
    icon: '📈',
    title: 'מעבר שלב',
    text: 'לאחר השמדת כל האויבים בשלב, עוברים אוטומטית לשלב הבא.',
  },
  {
    icon: '💀',
    title: 'הפסד',
    text: 'המשחק מסתיים כשמאבדים את כל 3 החיים.',
  },
];

export function HowToPlayPage() {
  return (
    <div className="page">
      <h1 className="page__title">איך לשחק</h1>
      <div className="how-to-play-page__sections">
        {SECTIONS.map((section) => (
          <section key={section.title} className="panel how-to-play-page__section">
            <span className="how-to-play-page__icon" aria-hidden="true">
              {section.icon}
            </span>
            <div>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
