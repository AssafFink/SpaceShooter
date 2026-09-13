import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  titleId: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * Dialog נגיש משותף — Milestone 5.
 * מקור: spec/PRD.md §4.14, spec/ARCHITECTURE.md §40, §55 (נגישות).
 *
 * `role="dialog"` + `aria-modal` + `aria-labelledby`; Esc וסגירה בלחיצה על
 * הרקע קוראים ל-`onClose` (מתפרש כ"ביטול" — הפעולה ההפיכה). מיקוד ראשוני
 * על ה-Panel כדי שמקלדת/קורא-מסך יזהו מיד שנפתח Dialog.
 */
export function Modal({ titleId, title, children, onClose }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className="modal__panel panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
