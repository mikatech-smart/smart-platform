import { AppModal } from "../AppModal";

import "./AppConfirm.css";

export type AppConfirmVariant = "simple" | "warning" | "danger" | "irreversible";

export type AppConfirmProps = {
  open: boolean;
  title: string;
  message: string;
  variant?: AppConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AppConfirm({
  open,
  title,
  message,
  variant = "simple",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: AppConfirmProps) {
  return (
    <AppModal
      open={open}
      title={title}
      onClose={onCancel}
      closeOnBackdrop={false}
      dialogClassName={`app-confirm app-confirm--${variant}`}
      footer={
        <>
          <button type="button" className="app-confirm__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="app-confirm__confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="app-confirm__message">{message}</p>
    </AppModal>
  );
}
