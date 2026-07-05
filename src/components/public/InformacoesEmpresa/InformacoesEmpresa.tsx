import "./InformacoesEmpresa.css";

interface InformacoesEmpresaProps {
  nome: string;
  categoria?: string | null;
  descricao?: string | null;
  googleReviewUrl?: string | null;
}

export default function InformacoesEmpresa({
  nome,
  categoria,
  descricao,
  googleReviewUrl,
}: InformacoesEmpresaProps) {
  return (
    <>
      {categoria && (
        <p className="public-empresa-category">
          {categoria}
        </p>
      )}

      <h1>{nome}</h1>

      {descricao && (
        <p className="public-empresa-description">
          {descricao}
        </p>
      )}

      {googleReviewUrl && (
        <a
          className="public-empresa-google-review"
          href={googleReviewUrl}
          target="_blank"
          rel="noreferrer"
        >
          {"\u2605\u2605\u2605\u2605\u2605 Avaliar no Google"}
        </a>
      )}
    </>
  );
}
