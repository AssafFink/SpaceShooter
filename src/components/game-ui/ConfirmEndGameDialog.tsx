import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ConfirmEndGameDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation Dialog for deliberately ending the game — spec/PRD.md §4.14, Flow 7.
 * Source: spec/ARCHITECTURE.md §40.
 *
 * A thin wrapper around the shared `Modal`. "Cancel" is the reversible
 * action (keep playing); "End Game" returns to the home screen without
 * saving the game (no localStorage involved in M5 at all). The game is
 * frozen (`engine.stop()`) for as long as this Dialog is open — see GamePage.
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
