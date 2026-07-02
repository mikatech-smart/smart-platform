import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}