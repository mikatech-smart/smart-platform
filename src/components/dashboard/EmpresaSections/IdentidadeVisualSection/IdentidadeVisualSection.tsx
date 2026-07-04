import Card from "../../../ui/Card";
import Button from "../../../ui/Button";

import type { Empresa } from "../../../../models/Empresa";

interface Props {
  empresa: Empresa;
  alterarCampo: (
    campo: keyof Empresa,
    valor: string
  ) => void;
}

export default function IdentidadeVisualSection({
  empresa,
}: Props) {
  return (
    <Card
      title="Identidade Visual"
      subtitle="Logo e banner da empresa"
    >
      <div className="grid lg:grid-cols-2 gap-8">

        <div>

          <label className="block mb-3 font-medium">
            Logo
          </label>

          <div className="border-2 border-dashed rounded-2xl p-8 text-center">

            <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-100 mx-auto flex items-center justify-center">

              {empresa.logo ? (
                <img
                  src={empresa.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-500">
                  Logo
                </span>
              )}

            </div>

            <Button
              variant="primary"
              className="mt-6"
            >
              Alterar Logo
            </Button>

          </div>

        </div>

        <div>

          <label className="block mb-3 font-medium">
            Banner
          </label>

          <div className="border-2 border-dashed rounded-2xl p-8 text-center">

            <div className="h-36 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">

              {empresa.banner ? (
                <img
                  src={empresa.banner}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-500">
                  Banner
                </span>
              )}

            </div>

            <Button
              variant="primary"
              className="mt-6"
            >
              Alterar Banner
            </Button>

          </div>

        </div>

      </div>

    </Card>
  );
}