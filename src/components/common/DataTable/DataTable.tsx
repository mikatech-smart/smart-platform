import type { ReactNode } from "react";

import { EmptyState } from "../EmptyState";
import "./DataTable.css";

export type DataTableColumn<TRow> = {
  id: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: TRow) => ReactNode;
  sortable?: boolean;
};

type DataTableProps<TRow> = {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowId: (row: TRow) => string;
  selectedRowId?: string;
  onRowClick?: (row: TRow) => void;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
  page?: number;
  pageSize?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onSort?: (columnId: string) => void;
  sortColumnId?: string;
  sortDirection?: "asc" | "desc";
};

export function DataTable<TRow>({
  columns,
  rows,
  getRowId,
  selectedRowId,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado.",
  loading = false,
  loadingRows = 5,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onSort,
  sortColumnId,
  sortDirection,
}: DataTableProps<TRow>) {
  const totalPages = pageSize && totalRows ? Math.max(1, Math.ceil(totalRows / pageSize)) : 0;
  return (
    <div className="data-table-wrap">
      <table className="data-table" role="grid">
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                className={column.headerClassName}
                key={column.id}
                scope="col"
                role="columnheader"
              >
                {column.sortable && onSort ? (
                  <button
                    type="button"
                    className="data-table__sort-button"
                    onClick={() => onSort(column.id)}
                  >
                    {column.label}
                    {sortColumnId === column.id ? (sortDirection === "desc" ? " ↓" : " ↑") : ""}
                  </button>
                ) : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }, (_, index) => (
                <tr key={`skeleton-${index}`} className="data-table__skeleton-row">
                  {columns.map((column) => (
                    <td key={column.id}>
                      <span className="data-table__skeleton" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length > 0
              ? rows.map((row) => {
                  const rowId = getRowId(row);
                  return (
                    <tr
                      key={rowId}
                      className={selectedRowId === rowId ? "data-table__row--selected" : undefined}
                      onClick={() => onRowClick?.(row)}
                      role="row"
                    >
                      {columns.map((column) => (
                        <td className={column.cellClassName} key={column.id} role="gridcell">
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              : (
                <tr>
                  <td className="data-table__empty" colSpan={columns.length}>
                    <EmptyState title={emptyMessage} />
                  </td>
                </tr>
              )}
        </tbody>
      </table>
      {page && totalPages > 1 && onPageChange && (
        <div className="data-table__pagination">
          <span>{totalRows} registros | Pagina {page} de {totalPages}</span>
          <div>
            <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Anterior
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Proxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
