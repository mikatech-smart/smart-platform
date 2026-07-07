import "./InformacoesEmpresa.css";

interface InformacoesEmpresaProps {
  nome: string;
  descricao?: string | null;
  googleReviewUrl?: string | null;
}

export default function InformacoesEmpresa({
  nome,
  descricao,
  googleReviewUrl,
}: InformacoesEmpresaProps) {
  return (
    <>
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
