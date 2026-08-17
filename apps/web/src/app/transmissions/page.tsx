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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-redlake-glow">
          <Radio className="h-3 w-3" />
          RÉSEAU SITE-12 // FLUX CLASSIFIÉ
        </p>
        <h1 className="text-4xl font-bold text-white">
          Transmissions de la Fondation
        </h1>
        <p className="mt-4 text-gray-500">
          Le bot du Site-12 surveille les canaux de la Fondation et consigne ici
          chaque transmission sous forme de rapport. Les identités sont codifiées et
          le contenu reste soumis à votre niveau d&apos;habilitation. Aucune
          communication classifiée n&apos;est exposée en clair.
        </p>
      </div>

      {!serverOpen && (
        <div className="mb-8 flex items-start gap-3 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
          <div className="text-sm text-gray-400">
            <p className="font-mono text-xs uppercase tracking-wider text-yellow-400">
              Phase pré-ouverture
            </p>
            <p className="mt-1">
              Le Site-12 n&apos;est pas encore pleinement opérationnel. Les
              transmissions ci-dessous proviennent des préparatifs et des essais du
              réseau. Rejoignez le{" "}
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
      )}

      <TransmissionsFeedConnected transmissions={transmissions} />

      <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/5 p-6 text-center">
        <MessageCircle className="h-6 w-6 text-[#aab1ff]" />
        <p className="text-sm text-gray-400">
          Toute l&apos;activité de la Fondation transite par le Discord officiel.
        </p>
        <a
          href={siteConfig.discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-[#5865F2]/40 bg-[#5865F2]/10 px-4 py-2 font-mono text-xs text-[#aab1ff] transition-colors hover:border-[#5865F2] hover:text-white"
        >
          Rejoindre le Discord
        </a>
      </div>
    </div>
  );
}
