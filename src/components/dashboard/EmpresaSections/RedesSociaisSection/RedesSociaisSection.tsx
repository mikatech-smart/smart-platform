import Card from "../../../ui/Card";
import Input from "../../../ui/Input";

import type { Empresa } from "../../../../models/Empresa";

interface Props {
  empresa: Empresa;
  alterarCampo: (
    campo: keyof Empresa,
    valor: string
  ) => void;
}

export default function RedesSociaisSection({
  empresa,
  alterarCampo,
}: Props) {
  return (
    <Card
      title="Redes Sociais"
      subtitle="Perfis da empresa"
    >
      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Instagram"
          value={empresa.instagram ?? ""}
          onChange={(e) =>
            alterarCampo("instagram", e.target.value)
          }
        />

        <Input
          label="Facebook"
          value={empresa.facebook ?? ""}
          onChange={(e) =>
            alterarCampo("facebook", e.target.value)
          }
        />

      </div>
    </Card>
  );
}