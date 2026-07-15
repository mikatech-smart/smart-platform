import { useEffect, useState } from "react";

import AppConfirm from "./AppConfirm";
import {
  resolveConfirmation,
  subscribeConfirmations,
  type ConfirmRequest,
} from "../../../utils/confirm";

export default function AppConfirmHost() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  useEffect(() => subscribeConfirmations(setRequest), []);

  return (
    <AppConfirm
      open={Boolean(request)}
      title={request?.title || "Confirmar acao"}
      message={request?.message || "Deseja continuar?"}
      variant={request?.variant}
      confirmLabel={request?.confirmLabel}
      cancelLabel={request?.cancelLabel}
      onConfirm={() => resolveConfirmation(true)}
      onCancel={() => resolveConfirmation(false)}
    />
  );
}
