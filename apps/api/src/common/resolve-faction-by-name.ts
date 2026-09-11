import { PrismaService } from '../prisma/prisma.service';
import { normalizeGradeName } from '../grades/grades.service';

export interface FactionRef {
  slug: string;
  name: string;
  color: string | null;
}

/**
 * Resout un champ texte libre ("faction") vers la vraie entree du
 * catalogue Faction quand une correspondance normalisee existe — meme
 * logique que FactionsService.findByName, extraite ici car utilisee par
 * plusieurs modeles dont le champ "faction" est reste du texte libre
 * (Character, MapLocation — voir leurs commentaires de schema : les
 * valeurs melangent de vraies factions et des groupes qui n'en sont pas).
 * Fonction pure (pas un provider Nest) : importable sans risque de cycle
 * de modules, contrairement a FactionsService lui-meme.
 *
 * buildFactionMatcher charge le catalogue une seule fois puis retourne
 * une fonction de correspondance en memoire — a utiliser pour resoudre
 * plusieurs entrees (ex. une liste de MapLocation) sans refaire une
 * requete par ligne. resolveFactionByName reste le raccourci pour un
 * seul texte (une fiche detail).
 */
export async function buildFactionMatcher(
  prisma: PrismaService,
): Promise<(factionText: string | null) => FactionRef | null> {
  const factions = await prisma.faction.findMany({
    select: { slug: true, name: true, color: true },
  });
  return (factionText) => {
    if (!factionText) return null;
    const key = normalizeGradeName(factionText);
    return factions.find((f) => normalizeGradeName(f.name) === key) ?? null;
  };
}

export async function resolveFactionByName(
  prisma: PrismaService,
  factionText: string | null,
): Promise<FactionRef | null> {
  const match = await buildFactionMatcher(prisma);
  return match(factionText);
}
