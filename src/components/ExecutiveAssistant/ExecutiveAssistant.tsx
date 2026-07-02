import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ExecutiveAssistant() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
      }}
      className="bg-white rounded-3xl shadow-lg p-8"
    >
      <div className="flex items-start justify-between">

        <div className="flex gap-5">

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center shadow-lg">

            <Bot
              size={34}
              className="text-white"
            />

          </div>

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-3xl font-bold text-gray-800">
                MiKA Advisor
              </h2>

              <Sparkles
                size={22}
                className="text-yellow-500"
              />

            </div>

            <p className="text-gray-500 mt-2">
              Seu consultor inteligente de crescimento.
            </p>

          </div>

        </div>

        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          IA Online
        </span>

      </div>

      <div className="mt-8 bg-gray-50 rounded-2xl p-6">

        <p className="text-lg text-gray-800 leading-8">

          👋 Bom dia!

          <br />
          <br />

          Analisei sua empresa hoje.

          <br />
          <br />

          Seu Business Score está em
          <strong className="text-green-600">
            {" "}78%
          </strong>.

          <br />
          <br />

          Minha principal recomendação é ativar o
          <strong className="text-green-600">
            {" "}Smart Reviews
          </strong>,
          pois isso pode aumentar sua reputação online e gerar mais clientes.

        </p>

      </div>

      <button
        className="
          mt-8
          bg-green-500
          hover:bg-green-600
          transition
          text-white
          px-6
          py-4
          rounded-2xl
          flex
          items-center
          gap-3
          font-semibold
        "
      >
        Conversar com MiKA Advisor

        <ArrowRight size={20} />

      </button>

    </motion.div>
  );
}