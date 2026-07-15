import type { ReactNode } from "react";

import "./FormSection.css";

export type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <section className={`form-section ${className}`.trim()}>
      <header className="form-section__header">
        <h3 className="form-section__title">{title}</h3>
        {description && <p className="form-section__description">{description}</p>}
      </header>
      <div className="form-section__body">{children}</div>
    </section>
  );
}
