import type { CardProps } from "./Card.types";

export default function Card({
  title,
  subtitle,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        p-6
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-bold text-slate-800">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}