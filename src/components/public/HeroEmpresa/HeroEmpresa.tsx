import "./HeroEmpresa.css";

interface HeroEmpresaProps {
  banner?: string | null;
  logo?: string | null;
  nome: string;
}

export default function HeroEmpresa({
  banner,
  logo,
  nome,
}: HeroEmpresaProps) {
  return (
    <>
      <div className="public-empresa-hero">
        {banner ? (
          <img src={banner} alt={`Banner ${nome}`} />
        ) : (
          <div className="public-empresa-banner__fallback" />
        )}
      </div>

      {logo && (
        <img
          className="public-empresa-logo"
          src={logo}
          alt={`Logo ${nome}`}
        />
      )}
    </>
  );
}
