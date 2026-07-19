import type { MouseEvent, ReactNode } from "react";

import "./DataGrid.css";

export type DataGridColumn<TRow> = {
  id: string;
  label: string;
  width?: string;
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
  onRowContextMenu?: (row: TRow, event: MouseEvent<HTMLTableRowElement>) => void;
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
      <div className="data-grid__scroll">
        <table className="data-grid__table">
          <colgroup>
            {columns.map((column) => (
              <col key={column.id} style={column.width ? { width: column.width } : undefined} />
            ))}
          </colgroup>
          <thead>
            <tr className="data-grid__header" role="row">
              {columns.map((column) => (
                <th
                  className={`data-grid__cell ${column.headerClassName || ""}`.trim()}
                  key={column.id}
                  role="columnheader"
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="data-grid__body">
            {rows.length ? (
              rows.map((row) => {
                const rowId = getRowId(row);
                const className = `data-grid__row ${
                  selectedRowId === rowId ? "data-grid__row--selected" : ""
                }`.trim();
                return (
                  <tr
                    aria-selected={selectedRowId === rowId}
                    className={className}
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    onContextMenu={(event) => {
                      if (!onRowContextMenu) return;
                      event.preventDefault();
                      onRowContextMenu(row, event);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick?.(row);
                      }
                    }}
                    role="row"
                    tabIndex={0}
                  >
                    {columns.map((column) => (
                      <td
                        className={`data-grid__cell ${column.cellClassName || ""}`.trim()}
                        key={column.id}
                        role="gridcell"
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr className="data-grid__empty" role="row">
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
