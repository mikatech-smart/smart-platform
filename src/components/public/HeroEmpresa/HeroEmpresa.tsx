import type { CSSProperties } from "react";

import "./HeroEmpresa.css";

interface HeroEmpresaProps {
  banner?: string | null;
  logo?: string | null;
  nome: string;
  logoExibicao?: "normal" | "hidden" | "small" | "pequeno" | "oculto";
  corFundoHero?: string | null;
}

export default function HeroEmpresa({
  banner,
  logo,
  nome,
  logoExibicao = "normal",
  corFundoHero,
}: HeroEmpresaProps) {
  const bannerUrl = banner?.trim() || "";
  const temBanner = Boolean(bannerUrl);
  const corHero = corFundoHero?.trim() || "";
  const logoModo = logoExibicao === "hidden" || logoExibicao === "oculto"
    ? "hidden"
    : "normal";
  const deveExibirLogo = Boolean(logo) && logoModo !== "hidden";
  const layoutHero = temBanner
    ? deveExibirLogo
      ? "banner-logo"
      : "banner-sem-logo"
    : deveExibirLogo
      ? "sem-banner-logo"
      : "sem-banner-sem-logo";

  return (
    <div
      className={`public-empresa-hero-shell public-empresa-hero-shell--${layoutHero}`}
      style={
        corHero
          ? ({
              "--mc-hero-background": corHero,
            } as CSSProperties)
          : undefined
      }
    >
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
          className={`public-empresa-logo public-empresa-logo--${logoModo} public-empresa-logo--${layoutHero}`}
          data-logo-exibicao={logoModo}
          data-hero-layout={layoutHero}
          src={logo || ""}
          alt={`Logo ${nome}`}
        />
      )}
    </div>
  );
}
