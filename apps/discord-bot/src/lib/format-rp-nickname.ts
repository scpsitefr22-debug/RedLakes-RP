/**
 * Pseudo Discord force pour tout joueur lie au site — encourage a renseigner
 * son identite RP (Prenom/Nom) tant que ce n'est pas fait :
 *  - RP non renseigne : "RP manquant | {pseudo Minecraft}"
 *  - RP renseigne     : "{Prenom} {Nom} | {pseudo Minecraft}"
 * Limite Discord : 32 caracteres max, toujours tronque en securite.
 */
export function formatRpNickname(profile: {
  rpFirstName?: string | null;
  rpLastName?: string | null;
  minecraftUsername?: string | null;
  grade?: string | null;
  teamName?: string | null;
}): string {
  const rpName = [profile.rpFirstName?.trim(), profile.rpLastName?.trim()]
    .filter(Boolean)
    .join(" ");
  const handle = profile.minecraftUsername?.trim() || profile.grade?.trim() || "Agent";

  if (rpName) return `${rpName} | ${handle}`.slice(0, 32);
  return `RP manquant | ${handle}`.slice(0, 32);
}

/** true si le joueur n'a pas encore renseigne son identite RP (Prenom/Nom) */
export function isRpIdentityMissing(profile: {
  rpFirstName?: string | null;
  rpLastName?: string | null;
}): boolean {
  return !profile.rpFirstName?.trim() && !profile.rpLastName?.trim();
}
