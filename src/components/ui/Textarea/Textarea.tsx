import { FormField } from "../../common/FormField";
import type { TextareaProps } from "./Textarea.types";

export default function Textarea({
  label,
  error,
  helperText,
  required,
  id,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      htmlFor={id}
    >
      <textarea
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        className={`min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""} ${className}`}
      />
    </FormField>
  );
}
