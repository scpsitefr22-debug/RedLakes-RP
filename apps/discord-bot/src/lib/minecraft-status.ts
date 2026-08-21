export interface McStatus {
  online: boolean;
  players?: { online: number; max: number };
  version?: string;
  motd?: { clean?: string[] };
}

export async function fetchMinecraftStatus(ip: string): Promise<McStatus> {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { online: false };
    return (await res.json()) as McStatus;
  } catch {
    return { online: false };
  }
}
