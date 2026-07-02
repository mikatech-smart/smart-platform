import type { ReactNode } from "react";

interface Props {
  title: string;
  icon: ReactNode;
  onClick?: () => void;
}

export default function QuickActionCard({
  title,
  icon,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
        bg-white
        rounded-2xl
        shadow-md
        p-6
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
        flex
        flex-col
        items-center
        gap-4
        w-full
      "
    >
      <div className="bg-lime-100 p-4 rounded-xl">
        {icon}
      </div>

      <span className="font-semibold text-gray-700">
        {title}
      </span>
    </button>
  );
}