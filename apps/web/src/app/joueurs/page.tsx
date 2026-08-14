import Image from "next/image";
import Link from "next/link";
import { User, Award } from "lucide-react";
import { API_URL } from "@/lib/api";

export const metadata = { title: "Base de données joueurs" };

async function getPlayers() {
  try {
    const res = await fetch(`${API_URL}/players`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function JoueursPage() {
  const players = await getPlayers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          REGISTRE PERSONNEL
        </p>
        <h1 className="text-4xl font-bold text-white">Base de données joueurs</h1>
        <p className="mt-4 text-gray-500">
          Profils synchronisés avec le serveur Minecraft : grade, faction et équipe
          mis à jour en temps réel après chaque promotion in-game.
        </p>
      </div>

      {players.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          <p>Aucun joueur enregistré. Lancez l&apos;API et connectez-vous via le tableau de bord.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player: {
            id: string;
            grade: string;
            faction: string;
            teamName?: string | null;
            rpFirstName?: string | null;
            rpLastName?: string | null;
            reputation: number;
            medals: string[];
            roleUpdatedAt?: string;
            user: { minecraftUsername: string; avatarUrl: string };
          }) => (
            <Link
              key={player.id}
              href={`/joueurs/${encodeURIComponent(player.user.minecraftUsername)}`}
              className="hologram-border block rounded-lg p-5 transition-colors hover:border-redlake/40"
            >
              <div className="mb-4 flex items-center gap-3">
                {player.user.avatarUrl ? (
                  <Image
                    src={player.user.avatarUrl}
                    alt={player.user.minecraftUsername}
                    width={48}
                    height={48}
                    className="rounded-full border border-redlake/30"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
                    <User className="h-6 w-6 text-redlake-glow" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">
                    {[player.rpFirstName, player.rpLastName].filter(Boolean).join(" ") ||
                      player.user.minecraftUsername}
                  </h3>
                  <p className="text-xs text-gray-500">{player.grade}</p>
                  {(player.rpFirstName || player.rpLastName) && (
                    <p className="font-mono text-[10px] text-gray-600">
                      MC : {player.user.minecraftUsername}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 font-mono text-xs text-gray-600">
                <p>Faction : <span className="text-gray-400">{player.faction}</span></p>
                {player.teamName && (
                  <p>Équipe : <span className="text-gray-400">{player.teamName}</span></p>
                )}
                <p>Réputation : <span className="text-gray-400">{player.reputation}/100</span></p>
                <p className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {player.medals.length} médaille(s)
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
