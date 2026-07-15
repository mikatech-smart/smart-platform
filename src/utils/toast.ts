import type { AppToastType } from "../components/common/AppToast";

export type ToastEvent = {
  id: number;
  message: string;
  type: AppToastType;
};

type ToastListener = (toast: ToastEvent) => void;

let nextToastId = 1;
const listeners = new Set<ToastListener>();

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyToast(message: string, type: AppToastType = "info") {
  const toast = { id: nextToastId++, message, type };
  listeners.forEach((listener) => listener(toast));
}
