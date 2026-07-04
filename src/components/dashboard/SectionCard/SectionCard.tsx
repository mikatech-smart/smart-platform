import Card from "../../ui/Card";
import type { SectionCardProps } from "./SectionCard.types";

export default function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: SectionCardProps) {
  return (
    <Card>

      <div className="flex items-start justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            {title}
          </h2>

          {subtitle && (
            <p className="text-slate-500 mt-1">
              {subtitle}
            </p>
          )}

        </div>

        {actions && (
          <div>
            {actions}
          </div>
        )}

      </div>

      {children}

    </Card>
  );
}