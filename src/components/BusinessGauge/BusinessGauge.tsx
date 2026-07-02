import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

interface Props {
  value: number;
}

export default function BusinessGauge({ value }: Props) {
  return (
    <div className="flex flex-col items-center">

      <div
        style={{
          width: 220,
          height: 220,
        }}
      >
        <CircularProgressbar
          value={value}
          text={`${value}`}
          styles={buildStyles({
            pathColor: "#22c55e",
            trailColor: "#E5E7EB",
            textColor: "#111827",
            textSize: "18px",
          })}
        />
      </div>

      <h2 className="text-xl font-bold mt-6">
        Business Score
      </h2>

      <p className="text-gray-500">
        Saúde Digital da Empresa
      </p>

    </div>
  );
}