import type { InputProps } from "./Input.types";

export default function Input({
  label,
  error,
  helperText,
  required,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">

      {label && (
        <label className="block mb-2 text-sm font-semibold text-slate-700">
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <input
        {...props}
        className={`
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-4
          py-3
          text-slate-800
          outline-none
          transition-all
          duration-200

          focus:border-green-500
          focus:ring-4
          focus:ring-green-100

          ${error ? "border-red-500" : ""}

          ${className}
        `}
      />

      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">
          {helperText}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}