import ClienteForm from "../../../components/clientes";
import { BrandConfig } from "../../../config/brand";

export default function CadastroCliente() {
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Novo Cliente
          </h1>

          <p className="text-gray-500 mt-2">
            Cadastre uma empresa para gerar automaticamente sua pagina do{" "}
            {BrandConfig.platformName}.
          </p>
        </div>

        <ClienteForm />
      </div>
    </main>
  );
}
