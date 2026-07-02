import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-green-600 hover:bg-green-700 text-white",

    secondary:
      "bg-slate-200 hover:bg-slate-300 text-slate-900",
  };

  return (
    <button
      {...props}
      className={`
        h-12
        rounded-xl
        px-6
        font-semibold
        transition-all
        duration-200

        ${variants[variant]}

        ${fullWidth ? "w-full" : ""}

        ${className}
      `}
    >
      {children}
    </button>
  );
}