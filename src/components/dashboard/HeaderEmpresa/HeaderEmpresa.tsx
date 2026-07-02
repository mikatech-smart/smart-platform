import Button from "../../ui/Button";
import type { HeaderEmpresaProps } from "./HeaderEmpresa.types";

export default function HeaderEmpresa({
  nome,
  categoria,
  logo,
  banner,
  publicado = false,
  ultimaAtualizacao,
  onPublicar,
}: HeaderEmpresaProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200">

      {/* Banner */}

      <div
        className="h-56 bg-green-500 bg-cover bg-center relative"
        style={{
          backgroundImage: banner
            ? `url(${banner})`
            : undefined,
        }}
      >

        <div className="absolute -bottom-16 left-8">

          <div className="w-32 h-32 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden">

            {logo ? (
              <img
                src={logo}
                alt={nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold">
                Logo
              </div>
            )}

          </div>

        </div>

      </div>

      <div className="pt-20 pb-8 px-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-800">
            {nome}
          </h1>

          <p className="text-slate-500 mt-2">
            {categoria}
          </p>

          <div className="mt-4 flex items-center gap-3">

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                publicado
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {publicado ? "Publicado" : "Rascunho"}
            </span>

            {ultimaAtualizacao && (
              <span className="text-sm text-slate-500">
                Atualizado em {ultimaAtualizacao}
              </span>
            )}

          </div>

        </div>

        <Button
          variant="primary"
          onClick={onPublicar}
        >
          Publicar
        </Button>

      </div>

    </section>
  );
}