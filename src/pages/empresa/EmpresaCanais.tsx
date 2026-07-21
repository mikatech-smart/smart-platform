import { useParams } from "react-router-dom";

import EmpresaForm from "../../components/dashboard/EmpresaForm";

export default function EmpresaCanais() {
  const { slug = "" } = useParams();

  return (
    <EmpresaForm
      empresaInicialSlug={slug}
      modoCliente
      escopo="erp"
      abaInicial="landing"
    />
  );
}
