import {
  LayoutDashboard,
  Building2,
  MessageCircle,
  Wifi,
  Smartphone,
  Star,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    icon: Building2,
    title: "Empresa",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
  },
  {
    icon: Wifi,
    title: "Wi-Fi",
  },
  {
    icon: Smartphone,
    title: "NFC",
  },
  {
    icon: Star,
    title: "Avaliações",
  },
  {
    icon: Users,
    title: "Clientes",
  },
  {
    icon: BarChart3,
    title: "Analytics",
  },
  {
    icon: Settings,
    title: "Configurações",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-white border-r min-h-screen shadow-sm">

      <div className="p-8">

        <h1 className="text-3xl font-bold text-green-600">
          Mika Connect
        </h1>

        <p className="text-gray-500 mt-1">
          Painel Administrativo
        </p>

      </div>

      <nav className="px-4">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition text-left mb-2"
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.title}
              </span>
            </button>
          );
        })}

      </nav>

    </aside>
  );
}