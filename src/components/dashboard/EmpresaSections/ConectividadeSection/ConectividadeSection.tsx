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

export default function ConectividadeSection({
  empresa,
  alterarCampo,
}: Props) {
  return (
    <Card
      title="Conectividade"
      subtitle="Wi-Fi e PIX"
    >
      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Nome da Rede Wi-Fi"
          value={empresa.wifi_nome ?? ""}
          onChange={(e) =>
            alterarCampo("wifi_nome", e.target.value)
          }
        />

        <Input
          label="Senha do Wi-Fi"
          value={empresa.wifi_senha ?? ""}
          onChange={(e) =>
            alterarCampo("wifi_senha", e.target.value)
          }
        />

        <div className="md:col-span-2">
          <Input
            label="Chave PIX"
            value={empresa.pix ?? ""}
            onChange={(e) =>
              alterarCampo("pix", e.target.value)
            }
          />
        </div>

      </div>
    </Card>
  );
}