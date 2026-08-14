"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onReset?: () => void;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher…",
  filters = [],
  onReset,
  className,
}: FilterBarProps) {
  const hasActive =
    (search && search.length > 0) ||
    filters.some((f) => f.value && f.value !== "ALL");

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded border border-metal/40 bg-black/20 p-3",
        className,
      )}
    >
      {onSearchChange !== undefined && (
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1 block font-mono text-[10px] uppercase text-gray-600">
            Recherche
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded border border-metal bg-black/40 py-1.5 pl-8 pr-3 text-sm text-white outline-none focus:border-redlake/50"
            />
          </div>
        </label>
      )}

      {filters.map((f) => (
        <label key={f.id} className="min-w-[8rem]">
          <span className="mb-1 block font-mono text-[10px] uppercase text-gray-600">
            {f.label}
          </span>
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="w-full rounded border border-metal bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-redlake/50"
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {hasActive && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 rounded border border-metal/50 px-2 py-1.5 font-mono text-[10px] text-gray-500 hover:text-white"
        >
          <X className="h-3 w-3" />
          Réinitialiser
        </button>
      )}
    </div>
  );
}
