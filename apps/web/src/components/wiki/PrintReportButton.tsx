"use client";

import { Printer } from "lucide-react";

export function PrintReportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 rounded border border-metal px-3 py-1.5 font-mono text-xs text-gray-400 transition-colors hover:border-redlake hover:text-white"
    >
      <Printer className="h-3.5 w-3.5" />
      Générer le rapport
    </button>
  );
}
