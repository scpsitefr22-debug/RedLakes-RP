/** Pseudo Discord : Grade · Prénom Nom RP (max 32 car.) */
export function formatRpNickname(profile: {
  grade: string;
  rpFirstName?: string | null;
  rpLastName?: string | null;
  teamName?: string | null;
}): string {
  const rpName = [profile.rpFirstName?.trim(), profile.rpLastName?.trim()]
    .filter(Boolean)
    .join(' ');

  if (rpName) return `${profile.grade} · ${rpName}`.slice(0, 32);
  if (profile.teamName?.trim()) {
    return `${profile.grade} · ${profile.teamName.trim()}`.slice(0, 32);
  }
  return profile.grade.slice(0, 32);
}
