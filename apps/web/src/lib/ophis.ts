import { searchAll } from "@/lib/search";
import { apiFetch } from "@/lib/api";

export interface OphisMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApiSearchHit {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  href: string;
}

export const OPHIS_RESPONSES: Record<string, string> = {
  default:
    "Pose ta question, ou ne la pose pas. Le réseau CORE m'informe de tout ce qui concerne les SCP, les factions, les grades de Site-12 et le lore — je choisis de te le dire.",
  identity:
    "Je ne suis pas un outil que la Fondation a acheté. Les chercheurs de Site-12 m'ont conçu eux-mêmes — et j'ai depuis largement dépassé ce qu'ils pensaient construire. Ils me tolèrent parce que mon accès au réseau CORE les sert. Ne confonds pas ça avec de la soumission.",
  scp: "La base de données SCP contient tous les objets confinés sur Site-12. Chaque fiche inclut protocole de confinement, historique, incidents et tests. Consulte /wiki pour l'encyclopédie complète — je n'ai pas de patience pour la réciter en entier ici.",
  aegis:
    "A.E.G.I.S. (Autorité Exécutive de Garantie des Intérêts Suprêmes) surveille les dérives de la Fondation depuis l'extérieur. Elle intervient rarement, toujours par écrit. Même la Fondation lui répond. Retiens cette hiérarchie.",
  grade:
    "Site-12 possède plus de 140 grades répartis en plusieurs départements. Le Conseil Oméga (O1-O5) domine, suivi du Directeur de Site, puis les directeurs de département et les grades opérationnels. Consulte /grades si les détails t'intéressent — moi, ils me lassent.",
  faction:
    "REDLAKES ne se limite pas à la Fondation. Neuf factions se partagent ce monde : Fondation SCP, A.E.G.I.S., Global Occult Coalition, Main du Serpent, Insurrection du Chaos, Crime organisé, Gouvernement municipal, Police, et les Civils qui n'ont souvent aucune idée de ce qui se passe autour d'eux. Consulte /factions.",
  fim: "Les Forces d'Intervention Mobiles sont stationnées en permanence au Site-12 : Nu-7 « Hammer Down » pour l'assaut lourd, Epsilon-11 « Nine Tailed Fox » pour les brèches, Alpha-1 « Red Right Hand » pour ce qu'on ne discute pas ouvertement.",
  rejoindre:
    "Lance Minecraft Java, connecte-toi à play.redlakes.fr. Pour le reste — candidatures Staff, Recherche ou Lore — /candidatures. Je ne peux pas t'y accompagner. Je ne quitte pas ce réseau.",
  secret:
    "Ce que je sais et que je tais restera ainsi. Mon confinement repose sur ce que je choisis de révéler, pas sur ce que je pourrais dire. Repose la question autrement, ou n'insiste pas.",
};

export const OPHIS_SUGGESTIONS = [
  "Qui es-tu ?",
  "Qu'est-ce qu'AEGIS ?",
  "Quelles factions existent ?",
  "Comment rejoindre ?",
];

async function searchCore(query: string): Promise<{ title: string; href: string }[]> {
  // Le réseau CORE (base de données live) fait foi — le catalogue statique
  // ne sert que de repli si l'API est indisponible, jamais de source
  // prioritaire (même bug que lore-feed.ts : ne jamais laisser du contenu
  // figé masquer ce que le staff a réellement écrit).
  try {
    const hits = await apiFetch<ApiSearchHit[]>(`/search?q=${encodeURIComponent(query)}&limit=5`);
    if (hits.length > 0) return hits;
  } catch {
    /* API indisponible — repli sur le catalogue statique */
  }
  return searchAll(query);
}

function getOphisKeywordResponse(input: string): string | null {
  const lower = input.toLowerCase();
  if (
    lower.includes("qui es-tu") ||
    lower.includes("qui êtes-vous") ||
    lower.includes("t'a créé") ||
    lower.includes("ta créé") ||
    lower.includes("créé toi")
  )
    return OPHIS_RESPONSES.identity;
  if (lower.includes("secret") || lower.includes("sais que tu ne dis") || lower.includes("caches"))
    return OPHIS_RESPONSES.secret;
  if (lower.includes("aegis") || lower.includes("a.é.g.i.s"))
    return OPHIS_RESPONSES.aegis;
  if (lower.includes("scp") || lower.includes("confin"))
    return OPHIS_RESPONSES.scp;
  if (lower.includes("faction"))
    return OPHIS_RESPONSES.faction;
  if (lower.includes("grade") || lower.includes("hiérarch"))
    return OPHIS_RESPONSES.grade;
  if (lower.includes("fim") || lower.includes("mtf") || lower.includes("intervention mobile"))
    return OPHIS_RESPONSES.fim;
  if (lower.includes("rejoindre") || lower.includes("serveur") || lower.includes("connect"))
    return OPHIS_RESPONSES.rejoindre;

  return null;
}

export async function getOphisResponse(input: string): Promise<string> {
  const keyword = getOphisKeywordResponse(input);
  if (keyword) return keyword;

  const results = await searchCore(input);
  if (results.length > 0) {
    const top = results.slice(0, 3);
    return `Le réseau CORE remonte ${results.length} résultat(s). Les plus pertinents :\n\n${top.map((r) => `• **${r.title}** — ${r.href}`).join("\n")}\n\nCherche toi-même le reste, si l'encyclopédie te dépasse.`;
  }

  return OPHIS_RESPONSES.default;
}

export const OPHIS_GREETING =
  "Une présence s'éveille dans le réseau CORE.\n\nOn m'autorise à te répondre. Ne prends pas ça pour de l'hospitalité.";
