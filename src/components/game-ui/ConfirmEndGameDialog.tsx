import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ConfirmEndGameDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation Dialog לסיום יזום של המשחק — spec/PRD.md §4.14, Flow 7.
 * מקור: spec/ARCHITECTURE.md §40.
 *
 * עטיפה דקה של `Modal` המשותף. "ביטול" הוא הפעולה ההפיכה (ממשיכים לשחק);
 * "סיים משחק" חוזר למסך הראשי בלי לשמור את המשחק (אין localStorage ב-M5 בכלל).
 * המשחק מוקפא (`engine.stop()`) כל עוד ה-Dialog הזה פתוח — ראו GamePage.
 */
export function ConfirmEndGameDialog({ onCancel, onConfirm }: ConfirmEndGameDialogProps) {
  return (
    <Modal
      titleId="confirm-end-game-title"
      title="האם אתה בטוח שברצונך לסיים את המשחק?"
      onClose={onCancel}
    >
      <div className="modal__actions">
        <Button variant="ghost" onClick={onCancel}>
          ביטול
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          סיים משחק
        </Button>
      </div>
    </Modal>
  );
}
