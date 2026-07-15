import {
  Home,
  MessageCircle,
  Settings,
  Smartphone,
  Star,
  Users,
  Wifi,
} from "lucide-react";

import { AppSidebar, type AppSidebarGroup } from "../common/AppSidebar";

const groups: AppSidebarGroup[] = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Visão Geral", icon: Home, end: true },
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/nfc", label: "NFC", icon: Smartphone },
      { to: "/wifi", label: "Wi-Fi", icon: Wifi },
      { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { to: "/reviews", label: "Reviews", icon: Star },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  return <AppSidebar groups={groups} />;
}
