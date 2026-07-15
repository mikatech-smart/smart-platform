import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import "./AppModal.css";

export type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  dialogClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  loading?: boolean;
  loadingText?: string;
  bare?: boolean;
  ariaLabel?: string;
};

export default function AppModal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  className = "",
  dialogClassName = "",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeLabel = "Fechar",
  loading = false,
  loadingText = "Carregando...",
  bare = false,
  ariaLabel,
}: AppModalProps) {
  const titleId = useId();
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape && !loading) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [closeOnEscape, loading, onClose, open]);

  if (!open) return null;

  const overlayClassName = [bare ? "" : "app-modal", className].filter(Boolean).join(" ");
  const contentClassName = [bare ? "" : "app-modal__dialog", dialogClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={overlayClassName}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <div className={contentClassName} onMouseDown={(event) => event.stopPropagation()}>
        {(title || eyebrow || showCloseButton) && !bare && (
          <header className="app-modal__header">
            <div>
              {eyebrow && <p className="app-modal__eyebrow">{eyebrow}</p>}
              {title && <h2 id={titleId}>{title}</h2>}
            </div>
            {showCloseButton && (
              <button type="button" className="app-modal__close" onClick={onClose} disabled={loading}>
                {closeLabel}
              </button>
            )}
          </header>
        )}

        <div className={bare ? undefined : "app-modal__body"}>
          {loading ? <div className="app-modal__loading">{loadingText}</div> : children}
        </div>

        {footer && !loading && <footer className="app-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}
