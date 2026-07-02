import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import BusinessGauge from "../BusinessGauge/BusinessGauge";
import { businessHealth } from "../../data/dashboard";

export default function BusinessHealth() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            ❤️ Business Health Score
          </h2>

          <p className="text-gray-500 mt-1">
            Veja como está a saúde digital do seu negócio.
          </p>
        </div>

        <div className="text-right">
          <h1 className="text-5xl font-bold text-green-600">
            {businessHealth.score}%
          </h1>

          <span className="text-green-600 font-semibold">
            {businessHealth.level}
          </span>
        </div>

      </div>

      {/* Business Gauge */}
      <div className="mt-10 flex justify-center">
        <BusinessGauge value={businessHealth.score} />
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">

        {/* Checklist */}
        <div>

          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <TrendingUp
              size={22}
              className="text-green-500"
            />

            Status da Plataforma
          </h3>

          <div className="space-y-4">

            {businessHealth.checklist.map((item) => (

              <div
                key={item.title}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >

                <span className="font-medium text-gray-700">
                  {item.title}
                </span>

                {item.active ? (
                  <CheckCircle2
                    size={22}
                    className="text-green-500"
                  />
                ) : (
                  <XCircle
                    size={22}
                    className="text-red-500"
                  />
                )}

              </div>

            ))}

          </div>

        </div>

        {/* Recomendações IA */}
        <div>

          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Sparkles
              size={22}
              className="text-yellow-500"
            />

            Recomendações da IA
          </h3>

          <div className="space-y-4">

            {businessHealth.recommendations.map((item) => (

              <div
                key={item}
                className="bg-green-50 border border-green-100 rounded-xl p-4"
              >
                💡 {item}
              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}