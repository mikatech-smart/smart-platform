import type { ReactNode } from "react";

import "./FormField.css";

export type FormFieldProps = {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export default function FormField({
  label,
  required = false,
  error,
  helperText,
  htmlFor,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label className="form-field__label" htmlFor={htmlFor}>
          <span>{label}</span>
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="form-field__message form-field__message--error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="form-field__message">{helperText}</p>
      ) : null}
    </div>
  );
}
