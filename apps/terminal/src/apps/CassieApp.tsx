import { useState } from "react";
import type { GlobalNarrativeSave } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

function getResponse(input: string, gns: GlobalNarrativeSave): string {
  const lower = input.toLowerCase();

  if (lower.includes("document") || lower.includes("log") || lower.includes("euclid")) {
    if (gns.world.documentsRead.includes("doc-euclid7-logs")) {
      return "Les logs Euclid-7 sont dans votre dossier. Écarts protocolaires confirmés — enquête interne non officielle.";
    }
    if (gns.world.documentsRead.includes("doc-site-rumor")) {
      return "NOTE_RUMEUR_INTERNE.txt consultée. Aucune confirmation AEGIS dans les registres officiels.";
    }
    return "Aucun document classifié n'est associé à votre clearance pour cette requête.";
  }

  if (lower.includes("incident") || lower.includes("brèche")) {
    if (gns.flags.cassie_queried_incidents) {
      return "Dernier incident : Brèche partielle Secteur Keter-02, 15 juin 2026. Durée : 47 minutes. Audit AEGIS niveau 3 en cours.";
    }
    return "Consultez le journal des incidents pour les entrées débloquées à votre niveau.";
  }

  if (lower.includes("chen")) {
    if (gns.sagaChoices["ch1_dr_chen_fate"] === "saved") {
      return "Dr. Mei Chen — Laboratoire Euclid-7. Statut : actif. Relation de confiance enregistrée.";
    }
    if (gns.sagaChoices["ch1_dr_chen_fate"] === "reported") {
      return "Dr. Mei Chen — Laboratoire Euclid-7. Signalement interne archivé. Contact déconseillé.";
    }
    if (gns.sagaChoices["ch1_dr_chen_fate"] === "ignored") {
      return "Dr. Mei Chen — Laboratoire Euclid-7. Dernier contact : non traité par l'utilisateur.";
    }
    return "Dr. Mei Chen — Laboratoire Euclid-7. Statut : actif.";
  }

  if (lower.includes("protocole") || lower.includes("anomalie")) {
    return "Procédure standard : signaler via canal sécurisé, ne pas intervenir seul, ne pas alerter le personnel non autorisé.";
  }

  if (lower.includes("aegis")) {
    if (gns.flags.ch1_site_rumor_spread) {
      return "Rumeur AEGIS non confirmée. Aucun déploiement officiel enregistré au Site-12.";
    }
    return "A.E.G.I.S. — Accès restreint clearance 4+. Données non disponibles à votre niveau.";
  }

  if (lower.includes("nu-7") || lower.includes("nu7") || lower.includes("vance")) {
    if (gns.sagaChoices["ch2_nu7_response"]) {
      return `FIM Nu-7 — Commandant Vance. Votre réponse à l'exercice : ${String(gns.sagaChoices["ch2_nu7_response"])}.`;
    }
    return "FIM Nu-7 — déploiement réservé aux situations de confinement critique.";
  }

  if (gns.sagaChoices["ch1_dr_chen_fate"] === "saved") {
    return "Note interne : vous avez établi un contact de confiance avec le personnel recherche. Je le note.";
  }

  return "CASSIE en ligne. Je peux vous assister pour : protocoles, localisation de personnel, incidents récents, documents.";
}

export function CassieApp() {
  const { gns } = useGNSRequired();
  const [messages, setMessages] = useState<{ role: "user" | "cassie"; text: string }[]>([
    { role: "cassie", text: "CASSIE en ligne. Site-12. Comment puis-je vous assister ?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "cassie", text: getResponse(userText, gns) }]);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs ${msg.role === "user" ? "text-right text-foreground" : "text-terminal"}`}
          >
            <span
              className={`inline-block max-w-[85%] px-3 py-2 ${
                msg.role === "user" ? "bg-redlake/20" : "bg-classified border border-panel-border"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-panel-border p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Requête CASSIE..."
          className="flex-1 border border-panel-border bg-classified px-3 py-2 text-xs text-foreground outline-none focus:border-terminal/50"
        />
        <button
          type="button"
          onClick={send}
          className="border border-panel-border px-3 py-2 text-xs text-terminal hover:bg-classified"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
