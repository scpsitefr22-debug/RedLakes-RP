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
      <span className="label-mono hidden h-9 items-center border border-line px-3 text-[10px] text-gray-600 sm:flex">
        …
      </span>
    );
  }

  if (!authenticated) {
    return (
      <Link
        href="/connexion"
        className="hidden h-9 w-9 items-center justify-center border border-line text-gray-400 transition-colors hover:border-line-strong hover:text-white sm:flex"
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
        className="flex h-9 max-w-[150px] items-center gap-2 border border-line bg-white/[0.03] px-3 text-xs text-gray-200 transition-colors hover:border-line-strong hover:text-white"
        title="Dossier agent"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
        <span className="truncate font-mono">
          {displayName ?? username ?? "Agent"}
        </span>
      </Link>
      <Link
        href="/intranet"
        className="flex h-9 w-9 items-center justify-center border border-line text-gray-400 transition-colors hover:border-line-strong hover:text-white"
        title="Intranet Site-12"
      >
        <Terminal className="h-4 w-4" />
      </Link>
      {isStaff && (
        <Link
          href="/staff"
          className="flex h-9 w-9 items-center justify-center border border-redlake/50 bg-redlake/15 text-redlake-glow transition-colors hover:bg-redlake/30"
          title="Tableau de bord staff"
        >
          <Lock className="h-4 w-4" />
        </Link>
      )}
      <NotificationBell />
      <button
        type="button"
        onClick={logout}
        className="flex h-9 w-9 items-center justify-center border border-line text-gray-500 transition-colors hover:border-line-strong hover:text-white"
        title="Déconnexion"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
