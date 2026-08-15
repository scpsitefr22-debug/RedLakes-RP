import Image from "next/image";
import Link from "next/link";
import { User, ShieldAlert } from "lucide-react";
import { API_URL } from "@/lib/api";

export const metadata = { title: "Gestion des joueurs — Staff" };

async function getPlayers() {
  try {
    const res = await fetch(`${API_URL}/players`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function StaffJoueursPage() {
  const players = await getPlayers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
        GESTION DES JOUEURS — STAFF
      </p>
      <h1 className="mb-4 text-4xl font-bold text-white">Joueurs</h1>
      <p className="mb-8 text-gray-500">
        Sélectionnez un joueur pour consulter son historique d&apos;affectations et
        ses sanctions, et en ajouter de nouvelles.
      </p>

      {players.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun joueur enregistré.
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player: {
            id: string;
            grade: string;
            faction: string;
            sanctions?: number;
            rpFirstName?: string | null;
            rpLastName?: string | null;
            user: { minecraftUsername: string; avatarUrl: string };
          }) => (
            <Link
              key={player.id}
              href={`/staff/joueurs/${encodeURIComponent(player.user.minecraftUsername)}`}
              className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
            >
              <div className="flex items-center gap-3">
                {player.user.avatarUrl ? (
                  <Image
                    src={player.user.avatarUrl}
                    alt={player.user.minecraftUsername}
                    width={40}
                    height={40}
                    className="rounded-full border border-redlake/30"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
                    <User className="h-5 w-5 text-redlake-glow" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">
                    {[player.rpFirstName, player.rpLastName].filter(Boolean).join(" ") ||
                      player.user.minecraftUsername}
                  </h3>
                  <p className="font-mono text-xs text-gray-600">
                    {player.user.minecraftUsername} — {player.grade}
                  </p>
                </div>
              </div>
              {!!player.sanctions && (
                <span className="flex items-center gap-1 font-mono text-xs text-red-400">
                  <ShieldAlert className="h-4 w-4" />
                  {player.sanctions}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
