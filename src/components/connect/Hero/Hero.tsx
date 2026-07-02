import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { COLORS } from "../../../theme/colors";
import { TYPOGRAPHY } from "../../../theme/typography";
import { SPACING } from "../../../theme/spacing";

import type { HeroProps } from "./Hero.types";

export default function Hero({
  cover,
  logo,
  companyName,
  category,
  description,
  rating,
  reviews,
  welcomeMessage = "Como podemos ajudar você hoje?",
}: HeroProps) {
  return (
    <header
      className="overflow-hidden bg-white"
      style={{
        borderRadius: SPACING.cardRadius,
        boxShadow: SPACING.cardShadow,
      }}
    >
      {/* Banner */}

      <div
        className="relative h-52 md:h-72 w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${cover})`,
          backgroundColor: COLORS.primary,
        }}
      />

      {/* Conteúdo */}

      <div className="relative px-6 pb-8">

        {/* Logo */}

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="-mt-16 flex justify-center"
        >
          <img
            src={logo}
            alt={companyName}
            className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover shadow-xl"
          />
        </motion.div>

        {/* Nome */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .2 }}
          className="text-center mt-6"
        >
          <h1
            style={TYPOGRAPHY.h1}
            className="text-gray-900"
          >
            {companyName}
          </h1>

          <p
            style={TYPOGRAPHY.title}
            className="text-gray-500 mt-2"
          >
            {category}
          </p>

          {/* Avaliação */}

          <div className="flex justify-center items-center gap-2 mt-4">

            <Star
              size={18}
              fill="#F59E0B"
              color="#F59E0B"
            />

            <span className="font-semibold">

              {rating}

            </span>

            <span className="text-gray-500">

              ({reviews} avaliações)

            </span>

          </div>

          {/* Descrição */}

          <p
            style={TYPOGRAPHY.body}
            className="max-w-xl mx-auto text-gray-600 mt-6"
          >
            {description}
          </p>

          {/* Boas-vindas */}

          <div
            className="mt-8 rounded-2xl p-5"
            style={{
              background: COLORS.background,
            }}
          >
            <h3
              style={TYPOGRAPHY.title}
              className="font-bold"
            >
              👋 Bem-vindo!
            </h3>

            <p
              style={TYPOGRAPHY.body}
              className="mt-2 text-gray-600"
            >
              {welcomeMessage}
            </p>

          </div>

        </motion.div>

      </div>

    </header>
  );
}