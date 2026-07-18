import type { MouseEvent, ReactNode } from "react";

import "./DataGrid.css";

export type DataGridColumn<TRow> = {
  id: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: TRow) => ReactNode;
};

type DataGridProps<TRow> = {
  columns: DataGridColumn<TRow>[];
  rows: TRow[];
  getRowId: (row: TRow) => string;
  selectedRowId?: string;
  onRowClick?: (row: TRow) => void;
  onRowContextMenu?: (row: TRow, event: MouseEvent<HTMLButtonElement>) => void;
  emptyMessage?: string;
};

export function DataGrid<TRow>({
  columns,
  rows,
  getRowId,
  selectedRowId,
  onRowClick,
  onRowContextMenu,
  emptyMessage = "Nenhum registro encontrado.",
}: DataGridProps<TRow>) {
  return (
    <div className="data-grid" role="grid">
      <div className="data-grid__header" role="row">
        {columns.map((column) => (
          <span
            className={`data-grid__cell ${column.headerClassName || ""}`.trim()}
            key={column.id}
            role="columnheader"
          >
            {column.label}
          </span>
        ))}
      </div>
      <div className="data-grid__body">
        {rows.length ? (
          rows.map((row) => {
            const rowId = getRowId(row);
            const className = `data-grid__row ${
              selectedRowId === rowId ? "data-grid__row--selected" : ""
            }`.trim();
            return (
              <button
                className={className}
                key={rowId}
                onClick={() => onRowClick?.(row)}
                onContextMenu={(event) => {
                  if (!onRowContextMenu) return;
                  event.preventDefault();
                  onRowContextMenu(row, event);
                }}
                role="row"
                type="button"
              >
                {columns.map((column) => (
                  <span
                    className={`data-grid__cell ${column.cellClassName || ""}`.trim()}
                    key={column.id}
                    role="gridcell"
                  >
                    {column.render(row)}
                  </span>
                ))}
              </button>
            );
          })
        ) : (
          <div className="data-grid__empty" role="row">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
