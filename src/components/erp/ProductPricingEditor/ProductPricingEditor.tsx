import { useEffect, useState } from "react";

export type ProductPricingValues = {
  custo: string;
  acrescimoVarejo: string;
  markupVarejo: string;
  precoVenda: string;
  acrescimoAtacado: string;
  markupAtacado: string;
  precoAtacado: string;
};

type ProductPricingEditorProps = ProductPricingValues & {
  canEditCost: boolean;
  canEditPrices: boolean;
  onChange: (values: ProductPricingValues) => void;
};

type PricingDraft = ProductPricingValues;
type PricingTable = "varejo" | "atacado";
type PricingField = "custo" | "acrescimo" | "markup" | "preco";

function parseInput(value: string) {
  const normalized = value.trim().replace(/%/g, "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDerived(value: number | null) {
  return value !== null && Number.isFinite(value) && value > 0
    ? value.toFixed(2)
    : "";
}

function calculateIndicators(custo: number | null, preco: number | null) {
  if (custo === null || custo <= 0 || preco === null || preco <= 0) {
    return { acrescimo: null, markup: null, margem: null };
  }

  const markup = preco / custo;
  const acrescimo = ((preco - custo) / custo) * 100;
  const margem = ((preco - custo) / preco) * 100;

  return {
    acrescimo: Number.isFinite(acrescimo) ? acrescimo : null,
    markup: Number.isFinite(markup) ? markup : null,
    margem: Number.isFinite(margem) ? margem : null,
  };
}

function calculatePriceByAcrescimo(custo: number | null, acrescimo: number | null) {
  if (custo === null || custo <= 0 || acrescimo === null) return null;
  const preco = custo * (1 + acrescimo / 100);
  return Number.isFinite(preco) && preco >= 0 ? preco : null;
}

function calculatePriceByMarkup(custo: number | null, markup: number | null) {
  if (custo === null || custo <= 0 || markup === null || markup < 0) return null;
  const preco = custo * markup;
  return Number.isFinite(preco) && preco >= 0 ? preco : null;
}

function createDraft(values: ProductPricingValues): PricingDraft {
  const custo = parseInput(values.custo);
  const precoVarejo = parseInput(values.precoVenda);
  const precoAtacado = parseInput(values.precoAtacado);
  const varejo = calculateIndicators(custo, precoVarejo);
  const atacado = calculateIndicators(custo, precoAtacado);

  return {
    custo: values.custo,
    acrescimoVarejo: formatDerived(varejo.acrescimo),
    markupVarejo: formatDerived(varejo.markup),
    precoVenda: values.precoVenda,
    acrescimoAtacado: formatDerived(atacado.acrescimo),
    markupAtacado: formatDerived(atacado.markup),
    precoAtacado: values.precoAtacado,
  };
}

export function normalizeProductPricingValues(values: ProductPricingValues) {
  return createDraft(values);
}

function commitField(draft: PricingDraft, field: PricingField, table?: PricingTable) {
  const next = { ...draft };
  const custo = parseInput(next.custo);

  const commitTable = (selectedTable: PricingTable) => {
    const priceField = selectedTable === "varejo" ? "precoVenda" : "precoAtacado";
    const acrescimoField = selectedTable === "varejo" ? "acrescimoVarejo" : "acrescimoAtacado";
    const markupField = selectedTable === "varejo" ? "markupVarejo" : "markupAtacado";

    if (field === "acrescimo") {
      const preco = calculatePriceByAcrescimo(custo, parseInput(next[acrescimoField]));
      next[priceField] = formatDerived(preco);
      const indicators = calculateIndicators(custo, preco);
      next[markupField] = formatDerived(indicators.markup);
      return;
    }

    if (field === "markup") {
      const preco = calculatePriceByMarkup(custo, parseInput(next[markupField]));
      next[priceField] = formatDerived(preco);
      const indicators = calculateIndicators(custo, preco);
      next[acrescimoField] = formatDerived(indicators.acrescimo);
      return;
    }

    const preco = parseInput(next[priceField]);
    const indicators = calculateIndicators(custo, preco);
    next[acrescimoField] = formatDerived(indicators.acrescimo);
    next[markupField] = formatDerived(indicators.markup);
  };

  if (field === "custo") {
    commitTable("varejo");
    commitTable("atacado");
  } else if (table) {
    commitTable(table);
  }

  return next;
}

export function ProductPricingEditor({
  custo,
  acrescimoVarejo,
  markupVarejo,
  precoVenda,
  acrescimoAtacado,
  markupAtacado,
  precoAtacado,
  canEditCost,
  canEditPrices,
  onChange,
}: ProductPricingEditorProps) {
  const sourceValues: ProductPricingValues = {
    custo,
    acrescimoVarejo,
    markupVarejo,
    precoVenda,
    acrescimoAtacado,
    markupAtacado,
    precoAtacado,
  };
  const [draft, setDraft] = useState<PricingDraft>(() => createDraft(sourceValues));

  useEffect(() => {
    setDraft(createDraft(sourceValues));
  }, [custo, precoVenda, precoAtacado]);

  function updateInput(
    field: keyof PricingDraft,
    value: string,
    semanticField: PricingField,
    table?: PricingTable
  ) {
    setDraft((current) =>
      commitField({ ...current, [field]: value }, semanticField, table)
    );
  }

  function finishEditing(field: PricingField, table?: PricingTable) {
    const next = commitField(draft, field, table);
    setDraft(next);
    onChange(next);
  }

  function inputProps(
    field: keyof PricingDraft,
    semanticField: PricingField,
    table?: PricingTable,
    disabled = false
  ) {
    return {
      inputMode: "decimal" as const,
      value: draft[field],
      disabled,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        updateInput(field, event.target.value, semanticField, table),
      onBlur: () => finishEditing(semanticField, table),
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") finishEditing(semanticField, table);
      },
    };
  }

  const varejo = calculateIndicators(parseInput(draft.custo), parseInput(draft.precoVenda));
  const atacado = calculateIndicators(parseInput(draft.custo), parseInput(draft.precoAtacado));

  return (
    <section className="public-pdv-stock-section">
      <div className="public-pdv-stock-section-header">
        <h3>Custos e precos</h3>
        <small>Varejo e atacado independentes</small>
      </div>
      <div className="public-pdv-price-form">
        <label className="public-pdv-price-base">
          Custo base
          <input {...inputProps("custo", "custo", undefined, !canEditCost)} />
        </label>

        <fieldset className="public-pdv-price-group">
          <legend>Varejo</legend>
          <label>
            Acréscimo (%)
            <input {...inputProps("acrescimoVarejo", "acrescimo", "varejo", !canEditCost)} />
          </label>
          <label>
            Markup
            <input {...inputProps("markupVarejo", "markup", "varejo", !canEditCost)} />
          </label>
          <label className="public-pdv-stock-metric">
            Margem (%)
            <strong>{formatDerived(varejo.margem) || "0,00"}%</strong>
          </label>
          <label>
            Preço final
            <input {...inputProps("precoVenda", "preco", "varejo", !canEditPrices)} />
          </label>
        </fieldset>

        <fieldset className="public-pdv-price-group">
          <legend>Atacado</legend>
          <label>
            Acréscimo (%)
            <input {...inputProps("acrescimoAtacado", "acrescimo", "atacado", !canEditCost)} />
          </label>
          <label>
            Markup
            <input {...inputProps("markupAtacado", "markup", "atacado", !canEditCost)} />
          </label>
          <label className="public-pdv-stock-metric">
            Margem (%)
            <strong>{formatDerived(atacado.margem) || "0,00"}%</strong>
          </label>
          <label>
            Preço final
            <input {...inputProps("precoAtacado", "preco", "atacado", !canEditPrices)} />
          </label>
        </fieldset>
      </div>
    </section>
  );
}
