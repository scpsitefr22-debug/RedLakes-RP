import { useCallback, useRef } from "react";

const STORAGE_KEY = "redlakes-terminal-sfx";

function readSfxEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true;
    return stored === "on";
  } catch {
    return true;
  }
}

export function writeSfxEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    /* ignore */
  }
}

export function useMessageSfx() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    async (frequency: number, durationMs: number, volume: number, type: OscillatorType = "sine") => {
      if (!readSfxEnabled()) return;
      try {
        const ctx = await ensureContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
        osc.start(now);
        osc.stop(now + durationMs / 1000 + 0.02);
      } catch {
        /* autoplay policy */
      }
    },
    [ensureContext]
  );

  const playReceive = useCallback(() => {
    void playTone(880, 60, 0.04);
    window.setTimeout(() => void playTone(1100, 50, 0.03), 55);
  }, [playTone]);

  const playSend = useCallback(() => {
    void playTone(520, 40, 0.035, "triangle");
  }, [playTone]);

  const playNotify = useCallback(() => {
    void playTone(660, 80, 0.045);
  }, [playTone]);

  return { playReceive, playSend, playNotify, sfxEnabled: readSfxEnabled() };
}
