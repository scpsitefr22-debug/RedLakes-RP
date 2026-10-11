import { Radio, AlertTriangle, MessageCircle } from "lucide-react";
import { getTransmissions } from "@/lib/transmissions";
import { siteConfig } from "@/config/site";
import { getSystemStatus } from "@/lib/system-status";
import { TransmissionsFeedConnected } from "@/components/transmissions/TransmissionsFeedConnected";

export const metadata = {
  title: "Transmissions de la Fondation",
  description:
    "Journal des transmissions du Site-12 : activité du réseau Discord retransmise en clair RP, classée par niveau d'habilitation.",
};

export default async function TransmissionsPage() {
  const [transmissions, { serverOpen }] = await Promise.all([
    getTransmissions(60),
    getSystemStatus(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <Radio className="h-3.5 w-3.5" />
          Réseau Site-12 — Journal radio
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Transmissions</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Le bot du Site-12 consigne ici chaque transmission des canaux de la Fondation. Les
          identités sont codées et chaque message reste soumis à votre habilitation : rien de
          classifié n&apos;apparaît en clair.
        </p>
      </div>

      {!serverOpen && (
        <div className="mb-6 overflow-hidden border border-yellow-400/30">
          <div className="hazard-stripes h-1.5" aria-hidden />
          <div className="flex items-start gap-3 bg-yellow-400/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div className="text-sm text-gray-300">
              <p className="label-mono text-[10px] text-yellow-400">Phase pré-ouverture</p>
              <p className="mt-1">
                Le Site-12 n&apos;est pas encore pleinement opérationnel : ces transmissions viennent
                des préparatifs du réseau. Rejoignez le{" "}
                <a
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#aab1ff] underline-offset-2 hover:underline"
                >
                  Discord de la Fondation
                </a>{" "}
                pour participer.
              </p>
            </div>
          </div>
        </div>
      )}

      <TransmissionsFeedConnected transmissions={transmissions} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border border-[#5865F2]/30 bg-[#5865F2]/5 p-5">
        <p className="flex items-center gap-3 text-sm text-gray-300">
          <MessageCircle className="h-5 w-5 shrink-0 text-[#aab1ff]" />
          Toute l&apos;activité de la Fondation transite par le Discord officiel.
        </p>
        <a
          href={siteConfig.discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display border border-[#5865F2]/50 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#c3c8ff] transition-colors hover:border-[#5865F2] hover:text-white"
        >
          Rejoindre le Discord
        </a>
      </div>
    </div>
  );
}
