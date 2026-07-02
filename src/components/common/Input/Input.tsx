import type { InputProps } from "./Input.types";

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">

      <label
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        {...props}
        className={`
          h-12
          rounded-xl
          border
          border-slate-300
          px-4
          text-slate-900
          outline-none
          transition-all
          duration-200
          focus:border-green-500
          focus:ring-4
          focus:ring-green-100
          ${className}
        `}
      />

      {error && (
        <span className="text-sm text-red-500">
          {error}
        </span>
      )}

    </div>
  );
}