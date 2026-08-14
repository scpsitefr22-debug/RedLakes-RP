import { Volume2, VolumeX, Monitor, Shield, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAmbientAudioContext } from "../context/AmbientAudioContext";
import { useGNSRequired } from "../context/GNSContext";
import { getPlayerDisplayName } from "@redlakes/narrative-core";
import { writeSfxEnabled } from "../hooks/useMessageSfx";

export function SettingsApp() {
  const { gns } = useGNSRequired();
  const { muted, setMuted } = useAmbientAudioContext();
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("redlakes-terminal-sfx");
      return stored === null || stored === "on";
    } catch {
      return true;
    }
  });

  const toggleSfx = (enabled: boolean) => {
    setSfxEnabled(enabled);
    writeSfxEnabled(enabled);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-panel-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Paramètres — Terminal Site-12
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <section className="border border-panel-border bg-classified p-4">
          <h3 className="flex items-center gap-2 text-xs text-foreground">
            <MessageSquare className="h-4 w-4 text-dashboard-accent" />
            Sons des messages
          </h3>
          <p className="mt-2 text-[10px] leading-relaxed text-metal">
            Bips discrets à l&apos;envoi et à la réception. Indépendant de l&apos;ambiance de fond.
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={sfxEnabled}
              onChange={(e) => toggleSfx(e.target.checked)}
              className="accent-dashboard-accent"
            />
            <span className="text-xs text-foreground">
              {sfxEnabled ? "Sons messages actifs" : "Sons messages coupés"}
            </span>
          </label>
        </section>

        <section className="border border-panel-border bg-classified p-4">
          <h3 className="flex items-center gap-2 text-xs text-foreground">
            <Volume2 className="h-4 w-4 text-terminal" />
            Audio ambiant
          </h3>
          <p className="mt-2 text-[10px] leading-relaxed text-metal">
            Bourdonnement discret des systèmes du Site. Désactivé par défaut — activez si vous
            souhaitez l&apos;immersion sonore.
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={!muted}
              onChange={(e) => setMuted(!e.target.checked)}
              className="accent-redlake"
            />
            <span className="flex items-center gap-1.5 text-xs text-foreground">
              {!muted ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-terminal" />
                  Ambiance active
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-metal" />
                  Ambiance coupée
                </>
              )}
            </span>
          </label>
        </section>

        <section className="border border-panel-border bg-classified p-4">
          <h3 className="flex items-center gap-2 text-xs text-foreground">
            <Monitor className="h-4 w-4 text-metal" />
            Session
          </h3>
          <dl className="mt-3 space-y-2 text-[10px]">
            <div className="flex justify-between gap-4">
              <dt className="text-metal">Utilisateur</dt>
              <dd className="text-foreground">{getPlayerDisplayName(gns)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-metal">Identifiant</dt>
              <dd className="font-mono text-foreground">{gns.player.employeeId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-metal">Save GNS</dt>
              <dd className="font-mono text-metal">{gns.saveId.slice(0, 8).toUpperCase()}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-panel-border bg-classified p-4">
          <h3 className="flex items-center gap-2 text-xs text-foreground">
            <Shield className="h-4 w-4 text-redlake" />
            Sécurité
          </h3>
          <p className="mt-2 text-[10px] text-metal">
            Clearance actuelle : niveau 1. Les paramètres avancés sont verrouillés par la
            politique Site-12.
          </p>
        </section>
      </div>
    </div>
  );
}
