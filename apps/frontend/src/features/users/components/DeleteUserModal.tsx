import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isLoading?: boolean;
}

export const DeleteUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false,
}: DeleteUserModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete <strong>{userName}</strong>? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Delete User
          </Button>
        </div>
      </div>
    </Modal>
  );
};
