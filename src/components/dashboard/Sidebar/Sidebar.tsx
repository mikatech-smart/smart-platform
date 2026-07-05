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
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    id: "empresas",
    icon: Building2,
    title: "Empresa",
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp",
  },
  {
    id: "wifi",
    icon: Wifi,
    title: "Wi-Fi",
  },
  {
    id: "nfc",
    icon: Smartphone,
    title: "NFC",
  },
  {
    id: "avaliacoes",
    icon: Star,
    title: "Avaliações",
  },
  {
    id: "clientes",
    icon: Users,
    title: "Clientes",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics",
  },
  {
    id: "configuracoes",
    icon: Settings,
    title: "Configurações",
  },
];

interface SidebarProps {
  nomeEmpresa?: string;
  logoEmpresa?: string | null;
  telaAtiva?: string;
  onNavigate?: (tela: string) => void;
}

export default function Sidebar({
  nomeEmpresa,
  logoEmpresa,
  telaAtiva = "dashboard",
  onNavigate,
}: SidebarProps) {
  const nomeWorkspace = nomeEmpresa || "Empresa";

  return (
    <aside className="w-72 bg-white border-r min-h-screen shadow-sm">

      <div className="p-8">

        <div className="flex items-center gap-3">
          {logoEmpresa && (
            <img
              src={logoEmpresa}
              alt={nomeWorkspace}
              className="h-12 w-12 rounded-xl border object-cover"
            />
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-green-600">
              {nomeWorkspace}
            </h1>

            <p className="text-gray-500 mt-1">
              Workspace da Empresa
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Powered by Mika Connect
            </p>
          </div>
        </div>


      </div>

      <nav className="px-4">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => onNavigate?.(item.id)}
              className={
                telaAtiva === item.id
                  ? "w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 text-green-700 transition text-left mb-2"
                  : "w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition text-left mb-2"
              }
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
