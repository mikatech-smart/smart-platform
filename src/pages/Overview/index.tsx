import {
  Users,
  Smartphone,
  Star,
  Wifi,
  MessageCircle,
  BarChart3,
} from "lucide-react";

import WelcomeCard from "../../components/WelcomeCard/WelcomeCard";
import ExecutiveBriefing from "../../components/ExecutiveBriefing/ExecutiveBriefing";
import BusinessHealth from "../../components/BusinessHealth/BusinessHealth";
import StatsCard from "../../components/StatsCard/StatsCard";
import QuickActionCard from "../../components/QuickActionCard/QuickActionCard";

import { dashboardStats, quickActions } from "../../data/dashboard";

const icons = {
  green: <Users size={30} className="text-green-600" />,
  blue: <Smartphone size={30} className="text-blue-600" />,
  yellow: <Star size={30} className="text-yellow-500" />,
  purple: <Wifi size={30} className="text-purple-600" />,
};

const actionIcons = {
  users: <Users size={30} className="text-green-600" />,
  smartphone: <Smartphone size={30} className="text-blue-600" />,
  star: <Star size={30} className="text-yellow-500" />,
  wifi: <Wifi size={30} className="text-purple-600" />,
  message: <MessageCircle size={30} className="text-green-500" />,
  chart: <BarChart3 size={30} className="text-red-500" />,
};

export default function Overview() {
  return (
    <div className="space-y-8">

      {/* Card de Boas-vindas */}
      <WelcomeCard />

      {/* Executive Briefing */}
      <ExecutiveBriefing />

      {/* Business Health */}
      <BusinessHealth />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {dashboardStats.map((item) => (
          <StatsCard
            key={item.id}
            title={item.title}
            value={item.value}
            description={item.description}
            icon={icons[item.color as keyof typeof icons]}
          />
        ))}
      </div>

      {/* Ações Rápidas */}
      <div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ⚡ Ações Rápidas
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {quickActions.map((item) => (
            <QuickActionCard
              key={item.id}
              title={item.title}
              icon={actionIcons[item.icon as keyof typeof actionIcons]}
            />
          ))}
        </div>

      </div>

    </div>
  );
}