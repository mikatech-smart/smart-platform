import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  className?: string;
}

export default function Card({
  children,
  title,
  footer,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white
        shadow-sm
        border
        border-slate-200
        p-6
        ${className}
      `}
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {title}
          </h2>
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );
}