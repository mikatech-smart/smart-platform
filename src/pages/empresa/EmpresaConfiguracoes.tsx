import { useParams } from "react-router-dom";

import EmpresaForm from "../../components/dashboard/EmpresaForm";

export default function EmpresaConfiguracoes() {
  const { slug = "" } = useParams();

  return (
    <EmpresaForm
      empresaInicialSlug={slug}
      modoCliente
      escopo="erp"
      abaInicial="aparencia"
    />
  );
}
