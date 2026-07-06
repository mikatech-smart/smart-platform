import "./HeroEmpresa.css";

interface HeroEmpresaProps {
  banner?: string | null;
  logo?: string | null;
  nome: string;
  logoExibicao?: "normal" | "pequeno" | "oculto";
}

export default function HeroEmpresa({
  banner,
  logo,
  nome,
  logoExibicao = "normal",
}: HeroEmpresaProps) {
  const temBanner = Boolean(banner);
  const deveExibirLogo = Boolean(logo) && logoExibicao !== "oculto";

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

      {deveExibirLogo && (
        <img
          className={`public-empresa-logo public-empresa-logo--${logoExibicao}`}
          src={logo || ""}
          alt={`Logo ${nome}`}
        />
      )}
    </>
  );
}
