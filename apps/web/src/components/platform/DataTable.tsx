"use client";

import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowClick,
  selectedKey,
  emptyMessage = "Aucun élément.",
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className={cn("text-sm text-gray-500", className)}>{emptyMessage}</p>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[32rem] border-collapse font-mono text-xs">
        <thead>
          <tr className="border-b border-metal/40 text-left text-[10px] uppercase text-gray-600">
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  "px-3 py-2 font-normal",
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = keyExtractor(row);
            const selected = selectedKey === key;
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-metal/20 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-redlake/5",
                  selected && "bg-redlake/10",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-3 py-2.5 text-gray-300",
                      col.hideOnMobile && "hidden sm:table-cell",
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
