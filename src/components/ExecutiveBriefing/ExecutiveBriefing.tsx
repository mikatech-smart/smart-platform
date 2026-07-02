import { Sparkles } from "lucide-react";

import { generateExecutiveBriefing } from "../../services/mika-ai";

export default function ExecutiveBriefing() {

  const briefing = generateExecutiveBriefing();

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-lime-500 rounded-3xl p-8 shadow-xl text-white">

      <div className="flex items-start gap-5">

        <div className="bg-white/20 p-4 rounded-2xl">

          <Sparkles size={34} />

        </div>

        <div>

          <h2 className="text-3xl font-bold">
            Executive Briefing
          </h2>

          <p className="opacity-90 mt-2">
            Resumo executivo gerado pelo MiKA OS
          </p>

          <div className="mt-8 space-y-3">

            <h3 className="text-2xl font-semibold">
              {briefing.title}
            </h3>

            <p className="text-lg">
              {briefing.message}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}