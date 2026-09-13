import './Wordmark.css';

/**
 * Styled "SPACE SHOOTER" wordmark — Milestone 5.
 * Source: spec/DESIGN.md (Mockups: Home screen + About screen).
 *
 * A CSS-based visual placeholder (Gradient + Glow) — not a graphic file.
 * Reused in HomePage and AboutPage for consistency. Kept as this CSS
 * wordmark rather than a real illustration/logo — see the Milestone 7 note
 * in spec/MILESTONES.md (can't be cleanly cut from the starfield background).
 */
export function Wordmark() {
  return (
    <h1 className="wordmark">
      <span className="wordmark__line wordmark__line--top">SPACE</span>
      <span className="wordmark__line wordmark__line--bottom">SHOOTER</span>
    </h1>
  );
}
