"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Terminal, Lock } from "lucide-react";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { apiFetch } from "@/lib/api";
import { NotificationBell } from "@/components/platform/NotificationBell";

export function HeaderAuth() {
  const router = useRouter();
  const { loading, authenticated, displayName, username, role } = usePlayerSession();
  const isStaff = role === "STAFF" || role === "ADMIN";

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/connexion");
    router.refresh();
  };

  if (loading) {
    return (
      <span className="hidden rounded border border-metal px-3 py-2 font-mono text-[10px] text-gray-600 sm:block">
        …
      </span>
    );
  }

  if (!authenticated) {
    return (
      <Link
        href="/connexion"
        className="hidden rounded border border-metal p-2 text-gray-400 transition-colors hover:border-redlake hover:text-white sm:block"
        aria-label="Connexion agent"
        title="Terminal d'habilitation"
      >
        <User className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/dashboard"
        className="flex max-w-[140px] items-center gap-2 rounded border border-redlake/30 bg-redlake/10 px-3 py-2 text-xs text-redlake-glow hover:bg-redlake/20"
        title="Dossier agent"
      >
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate font-mono">
          {displayName ?? username ?? "Agent"}
        </span>
      </Link>
      <Link
        href="/intranet"
        className="rounded border border-metal p-2 text-gray-400 hover:border-redlake hover:text-white"
        title="Intranet Site-12"
      >
        <Terminal className="h-4 w-4" />
      </Link>
      {isStaff && (
        <Link
          href="/staff"
          className="rounded border border-redlake/30 bg-redlake/10 p-2 text-redlake-glow hover:bg-redlake/20"
          title="Tableau de bord staff"
        >
          <Lock className="h-4 w-4" />
        </Link>
      )}
      <NotificationBell />
      <button
        type="button"
        onClick={logout}
        className="rounded border border-metal p-2 text-gray-500 hover:text-white"
        title="Déconnexion"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
