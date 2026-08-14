import { useCallback, useEffect, useRef, useState } from "react";

export type AmbientMode = "office" | "terminal" | "off";

const STORAGE_KEY = "redlakes-terminal-ambient";

function readMutedPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true;
    return stored === "muted";
  } catch {
    return true;
  }
}

function writeMutedPreference(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "muted" : "on");
  } catch {
    /* ignore */
  }
}

/** Ambiance procédurale légère — ventilation, bourdonnement, clavier distant */
export function useAmbientAudio(mode: AmbientMode) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; stops: Array<() => void> } | null>(null);
  const [muted, setMutedState] = useState(readMutedPreference);

  const stopAll = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    nodes.stops.forEach((s) => s());
    try {
      nodes.gain.disconnect();
    } catch {
      /* déjà déconnecté */
    }
    nodesRef.current = null;
  }, []);

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const startOffice = useCallback(
    async (ctx: AudioContext, master: GainNode) => {
      const stops: Array<() => void> = [];

      const ventGain = ctx.createGain();
      ventGain.gain.value = 0.018;
      ventGain.connect(master);

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const ventSrc = ctx.createBufferSource();
      ventSrc.buffer = noiseBuffer;
      ventSrc.loop = true;
      const ventFilter = ctx.createBiquadFilter();
      ventFilter.type = "bandpass";
      ventFilter.frequency.value = 180;
      ventFilter.Q.value = 0.6;
      ventSrc.connect(ventFilter);
      ventFilter.connect(ventGain);
      ventSrc.start();
      stops.push(() => ventSrc.stop());

      const humGain = ctx.createGain();
      humGain.gain.value = 0.006;
      humGain.connect(master);
      const hum = ctx.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 58;
      hum.connect(humGain);
      hum.start();
      stops.push(() => hum.stop());

      const hum2 = ctx.createOscillator();
      hum2.type = "sine";
      hum2.frequency.value = 120;
      const hum2Gain = ctx.createGain();
      hum2Gain.gain.value = 0.003;
      hum2.connect(hum2Gain);
      hum2Gain.connect(master);
      hum2.start();
      stops.push(() => hum2.stop());

      let keyboardTimer: number | undefined;
      const scheduleKeyboard = () => {
        const delay = 4000 + Math.random() * 8000;
        keyboardTimer = window.setTimeout(() => {
          if (!nodesRef.current) return;
          const clickGain = ctx.createGain();
          clickGain.gain.value = 0.012;
          clickGain.connect(master);
          const click = ctx.createOscillator();
          click.type = "square";
          click.frequency.value = 900 + Math.random() * 400;
          click.connect(clickGain);
          clickGain.gain.setValueAtTime(0.012, ctx.currentTime);
          clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
          click.start();
          click.stop(ctx.currentTime + 0.05);
          scheduleKeyboard();
        }, delay);
      };
      scheduleKeyboard();
      stops.push(() => {
        if (keyboardTimer) clearTimeout(keyboardTimer);
      });

      return stops;
    },
    []
  );

  const startTerminal = useCallback(async (ctx: AudioContext, master: GainNode) => {
    const stops: Array<() => void> = [];

    const fanGain = ctx.createGain();
    fanGain.gain.value = 0.01;
    fanGain.connect(master);

    const bufferSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;

    const fan = ctx.createBufferSource();
    fan.buffer = buf;
    fan.loop = true;
    const fanFilter = ctx.createBiquadFilter();
    fanFilter.type = "lowpass";
    fanFilter.frequency.value = 420;
    fan.connect(fanFilter);
    fanFilter.connect(fanGain);
    fan.start();
    stops.push(() => fan.stop());

    const pingGain = ctx.createGain();
    pingGain.gain.value = 0.006;
    pingGain.connect(master);
    const ping = ctx.createOscillator();
    ping.type = "sine";
    ping.frequency.value = 2400;
    ping.connect(pingGain);
    pingGain.gain.setValueAtTime(0, ctx.currentTime);
    ping.start();
    stops.push(() => ping.stop());

    let pingTimer: number | undefined;
    const schedulePing = () => {
      pingTimer = window.setTimeout(() => {
        if (!nodesRef.current) return;
        pingGain.gain.setValueAtTime(0.006, ctx.currentTime);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        schedulePing();
      }, 15000 + Math.random() * 20000);
    };
    schedulePing();
    stops.push(() => {
      if (pingTimer) clearTimeout(pingTimer);
    });

    return stops;
  }, []);

  useEffect(() => {
    if (muted || mode === "off") {
      stopAll();
      return;
    }

    let cancelled = false;

    (async () => {
      const ctx = await ensureContext();
      if (cancelled) return;

      stopAll();

      const master = ctx.createGain();
      master.gain.value = mode === "office" ? 0.9 : 0.7;
      master.connect(ctx.destination);

      const stops =
        mode === "office" ? await startOffice(ctx, master) : await startTerminal(ctx, master);

      if (cancelled) {
        stops.forEach((s) => s());
        return;
      }

      nodesRef.current = { gain: master, stops };
    })();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [mode, muted, ensureContext, startOffice, startTerminal, stopAll]);

  useEffect(() => {
    return () => {
      stopAll();
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [stopAll]);

  const setMuted = useCallback(
    (value: boolean) => {
      setMutedState(value);
      writeMutedPreference(value);
      if (value) stopAll();
    },
    [stopAll]
  );

  const toggleMuted = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  return { muted, setMuted, toggleMuted };
}
