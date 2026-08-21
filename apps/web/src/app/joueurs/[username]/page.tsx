import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Award, ArrowLeft, Clock } from "lucide-react";
import { API_URL } from "@/lib/api";
import { findGradeMeta } from "@/data/rp-grades";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `Dossier — ${decodeURIComponent(username)}` };
}

async function getPlayer(username: string) {
  try {
    const res = await fetch(
      `${API_URL}/players/${encodeURIComponent(username)}`,
      { cache: "no-store" },
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function JoueurProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const player = await getPlayer(decodeURIComponent(username));
  if (!player) notFound();

  const rpName = [player.rpFirstName, player.rpLastName].filter(Boolean).join(" ");
  const meta = findGradeMeta(player.grade);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/joueurs"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Registre personnel
      </Link>

      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          DOSSIER PERSONNEL // SITE-12
        </p>
        <h1 className="text-3xl font-bold text-white">
          {rpName || player.user.minecraftUsername}
        </h1>
        {rpName && (
          <p className="font-mono text-sm text-gray-600">
            Identifiant MC : {player.user.minecraftUsername}
          </p>
        )}
      </div>

      <div className="hologram-border rounded-lg p-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {player.user.avatarUrl ? (
            <Image
              src={player.user.avatarUrl}
              alt={player.user.minecraftUsername ?? "Joueur"}
              width={80}
              height={80}
              className="rounded-full border border-redlake/30"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
              <User className="h-8 w-8 text-redlake-glow" />
            </div>
          )}
          <div>
            <p className="text-lg text-white">{player.grade}</p>
            <p className="text-sm text-gray-400">{player.faction}</p>
            {player.teamName && (
              <p className="text-sm text-gray-500">Équipe : {player.teamName}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-metal/40 p-4">
            <p className="mb-1 font-mono text-[10px] text-gray-600">Réputation</p>
            <p className="font-mono text-lg text-white">{player.reputation}/100</p>
          </div>
          <div className="rounded border border-metal/40 p-4">
            <p className="mb-1 flex items-center gap-1 font-mono text-[10px] text-gray-600">
              <Award className="h-3 w-3" /> Médailles
            </p>
            <p className="text-white">
              {player.medals?.length ? player.medals.join(", ") : "Aucune"}
            </p>
          </div>
          <div className="rounded border border-metal/40 p-4">
            <p className="mb-1 flex items-center gap-1 font-mono text-[10px] text-gray-600">
              <Clock className="h-3 w-3" /> Dernière promotion
            </p>
            <p className="text-sm text-gray-400">
              {player.roleUpdatedAt
                ? new Date(player.roleUpdatedAt).toLocaleString("fr-FR")
                : "—"}
            </p>
          </div>
        </div>

        {meta?.description && (
          <p className="mt-6 border-t border-metal/30 pt-4 text-sm text-gray-500">
            {meta.description}
          </p>
        )}

        {player.sanctions > 0 && (
          <p className="mt-4 font-mono text-xs text-red-400/70">
            Sanctions actives : {player.sanctions}
          </p>
        )}
      </div>

      <p className="mt-6 text-center font-mono text-xs text-gray-600">
        Données synchronisées depuis Minecraft / Discord — usage RP Site-12.
      </p>
    </div>
  );
}
