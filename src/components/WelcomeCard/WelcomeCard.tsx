import { Sparkles } from "lucide-react";

export default function WelcomeCard() {
  return (
    <div
      className="
        bg-gradient-to-r
        from-lime-400
        to-green-500
        rounded-2xl
        p-8
        text-white
        shadow-lg
      "
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles size={34} />
        <h2 className="text-3xl font-bold">
          Bem-vindo à Mikatech Business OS
        </h2>
      </div>

      <p className="text-lg opacity-95">
        Sua plataforma para automatizar processos,
        conquistar clientes e acelerar o crescimento do seu negócio.
      </p>

      <div className="mt-6 flex gap-4 flex-wrap">
        <div className="bg-white/20 rounded-xl px-5 py-3">
          👥 Clientes
        </div>

        <div className="bg-white/20 rounded-xl px-5 py-3">
          📱 NFC Smart
        </div>

        <div className="bg-white/20 rounded-xl px-5 py-3">
          ⭐ Reviews
        </div>

        <div className="bg-white/20 rounded-xl px-5 py-3">
          🤖 IA Comercial
        </div>
      </div>
    </div>
  );
}