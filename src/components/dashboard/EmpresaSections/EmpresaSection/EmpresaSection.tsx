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

export default function EmpresaSection({
  empresa,
  alterarCampo,
}: Props) {
  return (
    <Card
      title="Informações da Empresa"
      subtitle="Dados principais da empresa"
    >
      <div className="grid md:grid-cols-2 gap-6">

        <Input
          label="Nome"
          value={empresa.nome}
          onChange={(e) =>
            alterarCampo("nome", e.target.value)
          }
        />

        <Input
          label="Categoria"
          value={empresa.categoria}
          onChange={(e) =>
            alterarCampo("categoria", e.target.value)
          }
        />

        <div className="md:col-span-2">

          <label className="block mb-2 text-sm font-semibold text-slate-700">
            Descrição
          </label>

          <textarea
            className="w-full rounded-xl border border-slate-300 p-4 h-36"
            value={empresa.descricao}
            onChange={(e) =>
              alterarCampo("descricao", e.target.value)
            }
          />

        </div>

      </div>
    </Card>
  );
}