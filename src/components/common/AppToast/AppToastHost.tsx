import { useEffect, useState } from "react";

import AppToast from "./AppToast";
import { subscribeToasts, type ToastEvent } from "../../../utils/toast";

export default function AppToastHost() {
  const [toast, setToast] = useState<ToastEvent | null>(null);

  useEffect(() => subscribeToasts(setToast), []);

  return (
    <AppToast
      open={Boolean(toast)}
      message={toast?.message || ""}
      type={toast?.type}
      onClose={() => setToast(null)}
    />
  );
}
