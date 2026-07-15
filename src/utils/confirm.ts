import type { AppConfirmVariant } from "../components/common/AppConfirm";

export type ConfirmRequest = {
  title: string;
  message: string;
  variant?: AppConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmationListener = (request: ConfirmRequest) => void;

const listeners = new Set<ConfirmationListener>();
let resolver: ((confirmed: boolean) => void) | null = null;

export function subscribeConfirmations(listener: ConfirmationListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestConfirm(request: ConfirmRequest) {
  return new Promise<boolean>((resolve) => {
    resolver?.(false);
    resolver = resolve;
    listeners.forEach((listener) => listener(request));
  });
}

export function resolveConfirmation(confirmed: boolean) {
  const currentResolver = resolver;
  resolver = null;
  currentResolver?.(confirmed);
}
