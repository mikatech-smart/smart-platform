import type { ButtonProps } from "./Button.types";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-green-600 hover:bg-green-700 text-white",

    secondary:
      "bg-slate-200 hover:bg-slate-300 text-slate-800",

    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",

    md: "px-5 py-3",

    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        rounded-xl
        font-semibold
        transition-all
        duration-200
        shadow-sm

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? "Carregando..." : children}
    </button>
  );
}