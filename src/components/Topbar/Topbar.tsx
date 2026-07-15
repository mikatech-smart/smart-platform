import { Bell, Search, UserCircle2 } from "lucide-react";
import { BrandConfig } from "../../config/brand";
import { AppHeader } from "../common/AppHeader";

export default function Topbar() {
  return (
    <AppHeader
      title={BrandConfig.platformName}
      subtitle="Bem-vindo ao painel administrativo."
      actions={
        <div className="flex items-center gap-6">

        <Search
          size={22}
          className="text-gray-500 cursor-pointer hover:text-green-500 transition"
        />

        <Bell
          size={22}
          className="text-gray-500 cursor-pointer hover:text-green-500 transition"
        />

        <UserCircle2
          size={34}
          className="text-green-500"
        />

        </div>
      }
    />
  );
}
