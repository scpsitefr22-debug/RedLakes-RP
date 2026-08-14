"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-gray-500",
        className,
      )}
    >
      <span>
        {total} résultat{total > 1 ? "s" : ""} — page {page}/{totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-metal/50 p-1.5 text-gray-400 transition-colors hover:text-white disabled:opacity-30"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-metal/50 p-1.5 text-gray-400 transition-colors hover:text-white disabled:opacity-30"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
