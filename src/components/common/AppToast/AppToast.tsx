import { useEffect } from "react";

import "./AppToast.css";

export type AppToastType = "success" | "error" | "warning" | "info";

export type AppToastProps = {
  open: boolean;
  message: string;
  type?: AppToastType;
  title?: string;
  duration?: number;
  onClose: () => void;
  dismissible?: boolean;
};

const toastIcons: Record<AppToastType, string> = {
  success: "OK",
  error: "!",
  warning: "!",
  info: "i",
};

export default function AppToast({
  open,
  message,
  type = "info",
  title,
  duration = 4000,
  onClose,
  dismissible = true,
}: AppToastProps) {
  useEffect(() => {
    if (!open || duration <= 0) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose, open]);

  if (!open || !message) return null;

  return (
    <div className="app-toast-viewport" aria-live={type === "error" ? "assertive" : "polite"}>
      <div className={`app-toast app-toast--${type}`} role="status">
        <span className="app-toast__icon" aria-hidden="true">{toastIcons[type]}</span>
        <div className="app-toast__content">
          {title && <strong>{title}</strong>}
          <p>{message}</p>
        </div>
        {dismissible && (
          <button type="button" className="app-toast__close" onClick={onClose} aria-label="Fechar notificacao">
            x
          </button>
        )}
      </div>
    </div>
  );
}
