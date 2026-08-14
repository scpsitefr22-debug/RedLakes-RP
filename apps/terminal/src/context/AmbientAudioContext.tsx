import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAmbientAudio, type AmbientMode } from "../hooks/useAmbientAudio";

interface AmbientAudioContextValue {
  muted: boolean;
  setMuted: (value: boolean) => void;
  toggleMuted: () => void;
  mode: AmbientMode;
  setAmbientMode: (mode: AmbientMode) => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null);

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const [mode, setAmbientMode] = useState<AmbientMode>("off");
  const { muted, setMuted, toggleMuted } = useAmbientAudio(mode);

  const value = useMemo(
    () => ({ muted, setMuted, toggleMuted, mode, setAmbientMode }),
    [muted, setMuted, toggleMuted, mode]
  );

  return (
    <AmbientAudioContext.Provider value={value}>{children}</AmbientAudioContext.Provider>
  );
}

export function useAmbientAudioContext() {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) throw new Error("useAmbientAudioContext must be used within AmbientAudioProvider");
  return ctx;
}
