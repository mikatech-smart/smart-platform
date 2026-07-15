import type { ReactNode } from "react";

import "./FormActions.css";

export type FormActionsProps = {
  children: ReactNode;
  align?: "start" | "end" | "between";
  className?: string;
};

export default function FormActions({
  children,
  align = "end",
  className = "",
}: FormActionsProps) {
  return (
    <div className={`form-actions form-actions--${align} ${className}`.trim()}>
      {children}
    </div>
  );
}
