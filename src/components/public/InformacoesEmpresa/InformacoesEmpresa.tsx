import "./InformacoesEmpresa.css";

interface InformacoesEmpresaProps {
  nome: string;
  categoria?: string | null;
  descricao?: string | null;
  horarioAtendimento?: string | null;
  googleReviewUrl?: string | null;
}

export default function InformacoesEmpresa({
  nome,
  categoria,
  descricao,
  horarioAtendimento,
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

      {horarioAtendimento && (
        <div className="public-empresa-hours">
          <span>Horario de Atendimento</span>
          <p>{horarioAtendimento}</p>
        </div>
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
