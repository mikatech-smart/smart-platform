import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

interface Props {
  value: number;
}

export default function BusinessGauge({ value }: Props) {
  const color =
    value >= 70
      ? "#22C55E"
      : value >= 40
      ? "#F59E0B"
      : "#EF4444";

  const status =
    value >= 70
      ? "Excelente"
      : value >= 40
      ? "Regular"
      : "Crítico";

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
      }}
      className="flex flex-col items-center"
    >
      <div
        className="rounded-full p-5"
        style={{
          boxShadow: `0 0 40px ${color}40`,
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
          }}
        >
          <CircularProgressbar
            value={value}
            text=""
            styles={buildStyles({
              pathColor: color,
              trailColor: "#E5E7EB",
            })}
          />
        </div>
      </div>

      <div className="-mt-36 text-center">

        <h1
          className="text-5xl font-bold"
          style={{
            color,
          }}
        >
          <CountUp
            end={value}
            duration={2}
          />
          %
        </h1>

        <p
          className="font-bold mt-2"
          style={{
            color,
          }}
        >
          {status}
        </p>

      </div>

      <h2 className="text-xl font-bold mt-20">
        Business Score
      </h2>

      <p className="text-gray-500">
        Saúde Digital da Empresa
      </p>

    </motion.div>
  );
}