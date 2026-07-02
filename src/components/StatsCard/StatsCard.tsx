import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300">

      <div className="flex items-center justify-between mb-6">

        <div>
          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-gray-800 mt-2">
            {value}
          </h2>
        </div>

        <div className="bg-lime-100 p-4 rounded-xl">
          {icon}
        </div>

      </div>

      <p className="text-gray-400">
        {description}
      </p>

    </div>
  );
}