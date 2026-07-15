import { AppHeader } from "../../components/common/AppHeader";

export default function Configuracoes() {
  return (
    <section className="space-y-6">
      <AppHeader
        title="Configurações"
        subtitle="Configure preferências gerais do painel administrativo."
      />

      <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
        Este módulo será implementado nas próximas sprints.
      </div>
    </section>
  );
}
