import HeaderEmpresa from "../../components/dashboard/HeaderEmpresa";
import EmpresaForm from "../../components/dashboard/EmpresaForm";

export default function Empresa() {
  return (
    <main className="max-w-7xl mx-auto p-8 space-y-8">

      <HeaderEmpresa
        nome="Mikatech"
        categoria="Comunicação Visual"
        publicado={true}
      />

      <EmpresaForm />

    </main>
  );
}