"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { FilterBar } from "@/components/platform/FilterBar";
import { Pagination } from "@/components/platform/Pagination";
import { DataTable, type DataTableColumn } from "@/components/platform/DataTable";
import { EntityTimeline } from "@/components/platform/EntityTimeline";
import { EntityComments } from "@/components/platform/EntityComments";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import {
  type PaginatedResult,
  buildQueryString,
} from "@/lib/platform-types";
import { cn } from "@/lib/utils";

type ReportType = "INCIDENT" | "AUTHORIZATION" | "MEMO" | "EQUIPMENT";
type ReportStatus = "PENDING" | "REVIEWED" | "ARCHIVED";

export interface PersonnelReport {
  id: string;
  type: ReportType;
  subject: string;
  content: string;
  status: ReportStatus;
  clearance: number;
  staffNote?: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<
  ReportStatus,
  { label: string; color: string }
> = {
  PENDING: { label: "En attente", color: "text-yellow-400" },
  REVIEWED: { label: "Traité", color: "text-green-400" },
  ARCHIVED: { label: "Archivé", color: "text-gray-500" },
};

const TYPE_LABELS: Record<ReportType, string> = {
  INCIDENT: "Incident",
  AUTHORIZATION: "Autorisation",
  MEMO: "Mémo",
  EQUIPMENT: "Matériel",
};

interface MyReportsPanelProps {
  refreshKey?: number;
}

export function MyReportsPanel({ refreshKey = 0 }: MyReportsPanelProps) {
  const [data, setData] = useState<PaginatedResult<PersonnelReport> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PersonnelReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<PaginatedResult<PersonnelReport>>(
        `/reports/me${buildQueryString({
          page,
          limit: 10,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          type: typeFilter !== "ALL" ? typeFilter : undefined,
          sort: "createdAt",
          order: "desc",
        })}`,
      );
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter(
      (r) =>
        r.subject.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: DataTableColumn<PersonnelReport>[] = [
    {
      id: "type",
      header: "Type",
      cell: (r) => (
        <span className="text-[10px] uppercase text-gray-600">{r.type}</span>
      ),
    },
    {
      id: "subject",
      header: "Objet",
      cell: (r) => <span className="text-white">{r.subject}</span>,
    },
    {
      id: "status",
      header: "Statut",
      cell: (r) => {
        const st = STATUS_LABELS[r.status];
        return <span className={st.color}>{st.label}</span>;
      },
      hideOnMobile: true,
    },
    {
      id: "date",
      header: "Date",
      cell: (r) => (
        <span className="flex items-center gap-1 text-gray-600">
          <Clock className="h-3 w-3" />
          {new Date(r.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
      hideOnMobile: true,
    },
  ];

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Objet ou contenu…"
        filters={[
          {
            id: "status",
            label: "Statut",
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setPage(1);
            },
            options: [
              { value: "ALL", label: "Tous" },
              { value: "PENDING", label: "En attente" },
              { value: "REVIEWED", label: "Traité" },
              { value: "ARCHIVED", label: "Archivé" },
            ],
          },
          {
            id: "type",
            label: "Type",
            value: typeFilter,
            onChange: (v) => {
              setTypeFilter(v);
              setPage(1);
            },
            options: [
              { value: "ALL", label: "Tous" },
              { value: "INCIDENT", label: "Incident" },
              { value: "AUTHORIZATION", label: "Autorisation" },
              { value: "MEMO", label: "Mémo" },
              { value: "EQUIPMENT", label: "Matériel" },
            ],
          },
        ]}
        onReset={resetFilters}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Chargement des dossiers…</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={filtered}
            keyExtractor={(r) => r.id}
            selectedKey={selected?.id ?? null}
            onRowClick={setSelected}
            emptyMessage="Aucun rapport déposé pour le moment."
          />
          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {selected && (
        <div className="rounded border border-redlake/30 bg-black/30 p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase text-gray-600">
                {TYPE_LABELS[selected.type]} —{" "}
                <span className={STATUS_LABELS[selected.status].color}>
                  {STATUS_LABELS[selected.status].label}
                </span>
              </p>
              <h4 className="text-lg font-bold text-white">{selected.subject}</h4>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="font-mono text-[10px] text-gray-600 hover:text-white"
            >
              Fermer
            </button>
          </div>
          <DiscordMarkdown text={selected.content} className="text-sm text-gray-400" />
          {selected.staffNote && (
            <p
              className={cn(
                "mt-3 border-l-2 border-green-400/40 pl-3 text-sm text-green-400/90",
              )}
            >
              <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
              {selected.staffNote}
            </p>
          )}
          <EntityTimeline
            entityType="PERSONNEL_REPORT"
            entityId={selected.id}
            className="mt-4"
          />
          <EntityComments
            entityType="PERSONNEL_REPORT"
            entityId={selected.id}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
}
