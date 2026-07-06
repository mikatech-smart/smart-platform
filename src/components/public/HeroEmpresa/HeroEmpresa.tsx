import "./HeroEmpresa.css";

interface HeroEmpresaProps {
  banner?: string | null;
  logo?: string | null;
  nome: string;
  logoExibicao?: "normal" | "small" | "hidden" | "pequeno" | "oculto";
}

export default function HeroEmpresa({
  banner,
  logo,
  nome,
  logoExibicao = "normal",
}: HeroEmpresaProps) {
  const bannerUrl = banner?.trim() || "";
  const temBanner = Boolean(bannerUrl);
  const logoModo = logoExibicao === "pequeno"
    ? "small"
    : logoExibicao === "oculto"
      ? "hidden"
      : logoExibicao;
  const deveExibirLogo = Boolean(logo) && logoModo !== "hidden";

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
            key={bannerUrl}
            src={bannerUrl}
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
          className={`public-empresa-logo public-empresa-logo--${logoModo}`}
          src={logo || ""}
          alt={`Logo ${nome}`}
        />
      )}
    </>
  );
}
