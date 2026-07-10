import { BrandConfig } from "../../../config/brand";
import "./RodapeEmpresa.css";

export default function RodapeEmpresa() {
  return (
    <footer className="public-empresa-footer">
      {BrandConfig.poweredByText}
    </footer>
  );
}
