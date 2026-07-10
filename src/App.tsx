import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { BrandConfig } from "./config/brand";

export default function App() {
  useEffect(() => {
    async function testarConexao() {
      console.log("✅ Supabase conectado!");

      console.log(import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase
        .from("empresas")
        .select("*");

      console.log(data);
      console.log(error);
    }

    testarConexao();
  }, []);

  return (
    <div
      style={{
        padding: 40,
        fontSize: 22,
        fontFamily: "Arial",
      }}
    >
      {BrandConfig.platformName}
    </div>
  );
}
