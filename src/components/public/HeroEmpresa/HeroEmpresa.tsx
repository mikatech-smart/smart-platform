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
  const temBanner = Boolean(banner);

  return (
    <>
      <div
        className={
          temBanner
            ? "public-empresa-hero public-empresa-hero--com-banner"
            : "public-empresa-hero public-empresa-hero--sem-banner"
        }
      >
        {temBanner ? (
          <img
            key={banner}
            src={banner || ""}
            alt={`Banner ${nome}`}
            decoding="async"
            className="public-empresa-banner"
          />
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
