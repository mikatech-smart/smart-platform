import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-5">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Mikatech Smart Platform
        </h1>

        <p className="text-sm text-gray-500">
          Bem-vindo ao painel administrativo.
        </p>
      </div>

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

    </header>
  );
}