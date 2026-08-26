import { API_URL } from "@/lib/api";
import { JoueursCatalog } from "@/components/joueurs/JoueursCatalog";

export const metadata = { title: "Base de données joueurs" };

interface ApiPlayer {
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
}

async function getPlayers(): Promise<ApiPlayer[]> {
  try {
    const res = await fetch(`${API_URL}/players`, { cache: "no-store" });
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
        <JoueursCatalog players={players} />
      )}
    </div>
  );
}
