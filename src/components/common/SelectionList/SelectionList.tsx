import "./SelectionList.css";
import { EmptyState } from "../EmptyState";

export type SelectionListItem = {
  id: string;
  label: string;
};

type SelectionListProps = {
  items: SelectionListItem[];
  onSelect: (id: string) => void;
  emptyMessage?: string;
  ariaLabel?: string;
};

export default function SelectionList({
  items,
  onSelect,
  emptyMessage = "Nenhuma opcao encontrada.",
  ariaLabel = "Opcoes de selecao",
}: SelectionListProps) {
  if (!items.length) {
    return <EmptyState title={emptyMessage} className="selection-list-empty" />;
  }

  return (
    <div className="selection-list" aria-label={ariaLabel} role="list">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="selection-list-item"
          onClick={() => onSelect(item.id)}
          role="listitem"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
