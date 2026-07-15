import { FormField } from "../FormField";
import type { InputProps } from "./Input.types";

export default function Input({
  label,
  error,
  helperText,
  required,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      htmlFor={id}
    >
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        className={`h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""} ${className}`}
      />
    </FormField>
  );
}
