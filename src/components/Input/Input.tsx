interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  error,
}: InputProps) {
  return (
    <div className="w-full">

      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full
          rounded-xl
          border
          px-4
          py-3
          outline-none
          transition-all
          duration-200
          bg-white

          ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-gray-300 focus:border-lime-500"
          }

          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : ""
          }
        `}
      />

      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
        </p>
      )}

    </div>
  );
}
