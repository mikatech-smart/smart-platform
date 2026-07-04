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

export default function ContatoSection({
  empresa,
  alterarCampo,
}: Props) {
  return (
    <Card
      title="Contato"
      subtitle="Informações para atendimento"
    >
      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Telefone"
          value={empresa.telefone}
          onChange={(e) =>
            alterarCampo("telefone", e.target.value)
          }
        />

        <Input
          label="WhatsApp"
          value={empresa.whatsapp}
          onChange={(e) =>
            alterarCampo("whatsapp", e.target.value)
          }
        />

        <Input
          label="E-mail"
          value={empresa.email}
          onChange={(e) =>
            alterarCampo("email", e.target.value)
          }
        />

        <Input
          label="Site"
          value={empresa.site}
          onChange={(e) =>
            alterarCampo("site", e.target.value)
          }
        />

      </div>
    </Card>
  );
}