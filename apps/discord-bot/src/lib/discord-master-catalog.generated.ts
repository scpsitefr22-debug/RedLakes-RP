/**
 * CATALOGUE DISCORD — genere automatiquement
 * Source : Branche Du Site 12 (4).xlsx
 * Regenerer : python scripts/generate-rp-catalog.py
 * Site + bot + API synchronises via le meme Excel.
 */

export type DiscordBranch =
  | "omega" | "direction" | "securite" | "scientifique"
  | "maintenance" | "general" | "classes" | "mtf"
  | "titres" | "aegis" | "chaos" | "serpent" | "goc"
  | "civil" | "gouvernement" | "police" | "illegal";

export interface DiscordFoundationGrade {
  excelName: string;
  displayName: string;
  branch: DiscordBranch | string;
}

export interface DiscordGradeSection {
  separator: string;
  roles: string[];
  note?: string;
}

export const GRADE_DISPLAY_NAMES: Record<string, string> = 
{
  "Président du Conseil (O1)": "👑 Président du Conseil (O1)",
  "Vice-Président — Sécurité (O2)": "🎖️ Vice-Président — Sécurité (O2)",
  "Conseiller — Sciences (O3)": "🔬 Conseiller — Sciences (O3)",
  "Conseiller — Maintenance (O4)": "🔧 Conseiller — Maintenance (O4)",
  "Conseiller — Services (O5)": "📋 Conseiller — Services (O5)",
  "DIRECTEUR DU SITE": "🏛️ Directeur du Site",
  "Adjoint-Directeur": "📎 Adjoint-Directeur",
  "Directeur Sécuriter": "〖🔫〗 Directeur Sécurité",
  "Adjoint-Directeur Se.": "〖🛡️〗 Adjoint-Directeur Sécurité",
  "Directeur Scientifique": "〖🔬〗 Directeur Scientifique",
  "Adjoint-Directeur Sc.": "〖⚗️〗 Adjoint-Directeur Scientifique",
  "Directeur-Adjoint Médical": "🩺 Directeur-Adjoint Médical",
  "Superviseur d'Intervention": "🚑 Superviseur d'Intervention",
  "Medecin en Chef": "💉 Médecin en Chef",
  "Chef de Com. en Soin": "💊 Chef de Com. en Soin",
  "Directeur Maintenance": "〖🔧〗 Directeur Maintenance",
  "Adjoint-Directeur Maint.": "🛠️ Adjoint-Directeur Maintenance",
  "Directeur Générale": "〖📋〗 Directeur Général",
  "Adjoint-Directeur-Générale": "📎 Adjoint-Directeur Général",
  "Commandant": "⚔️ Commandant",
  "Commandant Patrouilles": "🎯 Commandant Patrouilles",
  "Lieutenant de Terrain": "🎖️ Lieutenant de Terrain",
  "Lieutenant Sécuriter": "🔹 Lieutenant Sécurité",
  "Responsable Garde D": "👮 Responsable Garde D",
  "Géneral de Com.": "⭐ Général de Com.",
  "Instructeur / Formateur": "📚 Instructeur / Formateur",
  "Sergent Elite": "⚔️ Sergent Elite",
  "Caporal Elite": "🛡️ Caporal Elite",
  "Soldat Elite": "👮 Soldat Elite",
  "Sergent Prestige": "⚔️ Sergent Prestige",
  "Caporal Prestige": "🛡️ Caporal Prestige",
  "Soldat Prestige": "👮 Soldat Prestige",
  "Sergent": "⚔️ Sergent",
  "Caporal": "🛡️ Caporal",
  "Soldat": "👮 Soldat",
  "Caporal Garde": "🛡️ Caporal Garde",
  "Soldat Garde": "🛡️ Soldat Garde",
  "🎖️ Commandant MTF": "🎖️ Commandant MTF",
  "⚔️ Chef d'escouade MTF": "⚔️ Chef d'escouade MTF",
  "🪖 Opérateur MTF": "🪖 Opérateur MTF",
  "🔧 Spécialiste MTF": "🔧 Spécialiste MTF",
  "📋 Recrue MTF": "📋 Recrue MTF",
  "Superviseur d'Experience": "🧪 Superviseur d'Expérience",
  "Superviseur de SCP": "☣️ Superviseur de SCP",
  "Responsable d'Autorisation": "📋 Responsable d'Autorisation",
  "Chef d'Archive": "📚 Chef d'Archive",
  "Chef de Com.": "📢 Chef de Com.",
  "Scientifique Qualifier": "🔬 Scientifique Qualifier",
  "Scientifique Aguéris": "🧬 Scientifique Aguerris",
  "Scientifique Novice": "📝 Scientifique Novice",
  "Scientifique": "〖🔬〗 Membre Scientifique",
  "Chercheur Experimenter": "🧪 Chercheur Expérimenteur",
  "Chercheur Compétent": "📖 Chercheur Compétent",
  "Chercheur": "Ch.D Chercheur Débutant",
  "Archiviste": "📁 Archiviste",
  "Dr.": "🥼 Dr.",
  "Médecin / Psychologue": "💊 Médecin / Psychologue",
  "MEDECIN": "🩹 Médecin",
  "MEDECIN TERRAIN": "🩹 Médecin terrain",
  "M/C Dr.": "⚕️ M/C Dr.",
  "PSYCHOLOGUE": "🧠 Psychologue",
  "Responsable d'Entretien": "🧹 Responsable d'Entretien",
  "Responsable Livraison": "📦 Responsable Livraison",
  "Chef D'intervention": "🚨 Chef D'intervention",
  "Chef de Commande": "📡 Chef de Commande",
  "Com. de Maintenance": "🔩 Com. de Maintenance",
  "Chef Technicien": "🔧 Chef Technicien",
  "Technicien": "🔨 Technicien",
  "Plombier": "🚿 Plombier",
  "Electricien": "⚡ Électricien",
  "Mecanicien": "🏍️ Mécanicien",
  "Chef Receptionniste": "📬 Chef Réceptionniste",
  "Déménageur en Chef": "📦 Déménageur en Chef",
  "Travailleur": "👷 Travailleur",
  "Superviseur Secretaire": "🗂️ Superviseur Secrétaire",
  "Superviseur Restauration": "🍳 Superviseur Restauration",
  "Superviseur Nettoyage": "🧽 Superviseur Nettoyage",
  "Superviseur Communication": "📢 Superviseur Communication",
  "Secrétaire Admin.": "🗂️ Secrétaire Admin.",
  "Secrétaire Secu.": "📋 Secrétaire Sécu.",
  "Secrétaire Scient.": "📄 Secrétaire Scient.",
  "Secrétaire Medic": "💊 Secrétaire Médic",
  "Secrétaire Maint.": "🔧 Secrétaire Maint.",
  "Secrétaire Adj. Admin.": "📝 Secrétaire Adj. Admin.",
  "Secrétaire Adj. Secu.": "📝 Secrétaire Adj. Secu.",
  "Secrétaire Adj. Scient.": "📝 Secrétaire Adj. Scient.",
  "Secrétaire Adj. Medic": "📝 Secrétaire Adj. Medic",
  "Secrétaire Adj. Maint.": "📝 Secrétaire Adj. Maint.",
  "Chef de Cuisine": "👨‍🍳 Chef de Cuisine",
  "Concierge": "🧹 Concierge",
  "Com. Sécuriter": "📣 Com. Sécurité",
  "Com. Scientifique": "📣 Com. Scientifique",
  "Com. Maintenance": "📣 Com. Maintenance",
  "Com. Extérieur": "🌍 Com. Extérieur",
  "Com. Interne": "🏠 Com. Interne",
  "🏅 Elite": "🏅 Elite",
  "⭐ Prestige": "⭐ Prestige",
  "Class - S": "🔒 Class-S",
  "Class - B": "🔒 Class-B",
  "Class - D": "🔒 Class-D",
  "🛡️ Président du Directoire": "🛡️ Président du Directoire",
  "⚖️ Membre du Directoire": "⚖️ Membre du Directoire",
  "🔍 Inspecteur principal": "🔍 Inspecteur principal",
  "📋 Inspecteur adjoint": "📋 Inspecteur adjoint",
  "📊 Analyste AEGIS": "📊 Analyste AEGIS",
  "⚔️ Commandant de cellule": "⚔️ Commandant de cellule",
  "👤 Agent d'application": "👤 Agent d'application",
  "💚 Commandant de secteur": "💚 Commandant de secteur",
  "⚔️ Officier du Chaos": "⚔️ Officier du Chaos",
  "🔴 Chef de cellule": "🔴 Chef de cellule",
  "🪖 Vétéran du Chaos": "🪖 Vétéran du Chaos",
  "👤 Soldat Chaos": "👤 Soldat Chaos",
  "〚🔍〛 Recrue Chaos": "〚🔍〛 Recrue Chaos",
  "🐍 Grand Maître": "🐍 Grand Maître",
  "🔮 Archimage": "🔮 Archimage",
  "📿 Initié": "📿 Initié",
  "🕯️ Acolyte": "🕯️ Acolyte",
  "🌐 Directeur régional": "🌐 Directeur régional",
  "🤝 Officier de liaison": "🤝 Officier de liaison",
  "⚔️ Commandant d'unité": "⚔️ Commandant d'unité",
  "🪖 Soldat GOC": "🪖 Soldat GOC",
  "☣️ Technicien PSYCHE": "☣️ Technicien PSYCHE",
  "🧑 Citoyen REDLAKES": "🧑 Citoyen REDLAKES",
  "🆕 Nouvel arrivant": "🆕 Nouvel arrivant",
  "🎓 Étudiant / Stagiaire": "🎓 Étudiant / Stagiaire",
  "🏪 Propriétaire / Patron": "🏪 Propriétaire / Patron",
  "🍺 Employé bar & loisirs": "🍺 Employé bar & loisirs",
  "🛒 Employé commerce": "🛒 Employé commerce",
  "📰 Journaliste": "📰 Journaliste",
  "📺 Rédacteur / Médias": "📺 Rédacteur / Médias",
  "🏥 Directeur hôpital": "🏥 Directeur hôpital",
  "🩺 Médecin urgentiste": "🩺 Médecin urgentiste",
  "👨‍⚕️ Infirmier": "👨‍⚕️ Infirmier",
  "🚑 Paramedic / EMT": "🚑 Paramedic / EMT",
  "🚌 Chauffeur / Transit": "🚌 Chauffeur / Transit",
  "🔧 Technicien municipal": "🔧 Technicien municipal",
  "🏗️ Ouvrier municipal": "🏗️ Ouvrier municipal",
  "🏛️ Maire de REDLAKES": "🏛️ Maire de REDLAKES",
  "📋 City Manager": "📋 City Manager",
  "💼 Conseiller municipal": "💼 Conseiller municipal",
  "📎 Attaché administratif": "📎 Attaché administratif",
  "👤 Employé municipal": "👤 Employé municipal",
  "🚔 Chief of Police": "🚔 Chief of Police",
  "🎖️ Lieutenant": "🎖️ Lieutenant",
  "👮 Police Officer": "👮 Police Officer",
  "🔰 Deputy": "🔰 Deputy",
  "🔍 Detective": "🔍 Detective",
  "🕵️ Investigator": "🕵️ Investigator",
  "💀 Gang Member": "💀 Gang Member",
  "🔫 Gang Boss": "🔫 Gang Boss",
  "🍝 Mafia Associate": "🍝 Mafia Associate",
  "🎩 Mafia Don": "🎩 Mafia Don",
  "🏍️ MC Member": "🏍️ MC Member",
  "🏍️ MC President": "🏍️ MC President",
  "💊 Cartel Runner": "💊 Cartel Runner",
  "💊 Cartel Boss": "💊 Cartel Boss",
  "🌃 Criminel indépendant": "🌃 Criminel indépendant"
};

export const DISCORD_FOUNDATION_GRADES: DiscordFoundationGrade[] = 
[
  {
    "excelName": "Président du Conseil (O1)",
    "displayName": "👑 Président du Conseil (O1)",
    "branch": "omega"
  },
  {
    "excelName": "Vice-Président — Sécurité (O2)",
    "displayName": "🎖️ Vice-Président — Sécurité (O2)",
    "branch": "omega"
  },
  {
    "excelName": "Conseiller — Sciences (O3)",
    "displayName": "🔬 Conseiller — Sciences (O3)",
    "branch": "omega"
  },
  {
    "excelName": "Conseiller — Maintenance (O4)",
    "displayName": "🔧 Conseiller — Maintenance (O4)",
    "branch": "omega"
  },
  {
    "excelName": "Conseiller — Services (O5)",
    "displayName": "📋 Conseiller — Services (O5)",
    "branch": "omega"
  },
  {
    "excelName": "DIRECTEUR DU SITE",
    "displayName": "🏛️ Directeur du Site",
    "branch": "direction"
  },
  {
    "excelName": "Adjoint-Directeur",
    "displayName": "📎 Adjoint-Directeur",
    "branch": "direction"
  },
  {
    "excelName": "Directeur Sécuriter",
    "displayName": "〖🔫〗 Directeur Sécurité",
    "branch": "direction"
  },
  {
    "excelName": "Adjoint-Directeur Se.",
    "displayName": "〖🛡️〗 Adjoint-Directeur Sécurité",
    "branch": "direction"
  },
  {
    "excelName": "Directeur Scientifique",
    "displayName": "〖🔬〗 Directeur Scientifique",
    "branch": "direction"
  },
  {
    "excelName": "Adjoint-Directeur Sc.",
    "displayName": "〖⚗️〗 Adjoint-Directeur Scientifique",
    "branch": "direction"
  },
  {
    "excelName": "Directeur-Adjoint Médical",
    "displayName": "🩺 Directeur-Adjoint Médical",
    "branch": "direction"
  },
  {
    "excelName": "Superviseur d'Intervention",
    "displayName": "🚑 Superviseur d'Intervention",
    "branch": "direction"
  },
  {
    "excelName": "Medecin en Chef",
    "displayName": "💉 Médecin en Chef",
    "branch": "direction"
  },
  {
    "excelName": "Chef de Com. en Soin",
    "displayName": "💊 Chef de Com. en Soin",
    "branch": "direction"
  },
  {
    "excelName": "Directeur Maintenance",
    "displayName": "〖🔧〗 Directeur Maintenance",
    "branch": "direction"
  },
  {
    "excelName": "Adjoint-Directeur Maint.",
    "displayName": "🛠️ Adjoint-Directeur Maintenance",
    "branch": "direction"
  },
  {
    "excelName": "Directeur Générale",
    "displayName": "〖📋〗 Directeur Général",
    "branch": "direction"
  },
  {
    "excelName": "Adjoint-Directeur-Générale",
    "displayName": "📎 Adjoint-Directeur Général",
    "branch": "direction"
  },
  {
    "excelName": "Commandant",
    "displayName": "⚔️ Commandant",
    "branch": "securite"
  },
  {
    "excelName": "Commandant Patrouilles",
    "displayName": "🎯 Commandant Patrouilles",
    "branch": "securite"
  },
  {
    "excelName": "Lieutenant de Terrain",
    "displayName": "🎖️ Lieutenant de Terrain",
    "branch": "securite"
  },
  {
    "excelName": "Lieutenant Sécuriter",
    "displayName": "🔹 Lieutenant Sécurité",
    "branch": "securite"
  },
  {
    "excelName": "Responsable Garde D",
    "displayName": "👮 Responsable Garde D",
    "branch": "securite"
  },
  {
    "excelName": "Géneral de Com.",
    "displayName": "⭐ Général de Com.",
    "branch": "securite"
  },
  {
    "excelName": "Instructeur / Formateur",
    "displayName": "📚 Instructeur / Formateur",
    "branch": "securite"
  },
  {
    "excelName": "Sergent Elite",
    "displayName": "⚔️ Sergent Elite",
    "branch": "securite"
  },
  {
    "excelName": "Caporal Elite",
    "displayName": "🛡️ Caporal Elite",
    "branch": "securite"
  },
  {
    "excelName": "Soldat Elite",
    "displayName": "👮 Soldat Elite",
    "branch": "securite"
  },
  {
    "excelName": "Sergent Prestige",
    "displayName": "⚔️ Sergent Prestige",
    "branch": "securite"
  },
  {
    "excelName": "Caporal Prestige",
    "displayName": "🛡️ Caporal Prestige",
    "branch": "securite"
  },
  {
    "excelName": "Soldat Prestige",
    "displayName": "👮 Soldat Prestige",
    "branch": "securite"
  },
  {
    "excelName": "Sergent",
    "displayName": "⚔️ Sergent",
    "branch": "securite"
  },
  {
    "excelName": "Caporal",
    "displayName": "🛡️ Caporal",
    "branch": "securite"
  },
  {
    "excelName": "Soldat",
    "displayName": "👮 Soldat",
    "branch": "securite"
  },
  {
    "excelName": "Caporal Garde",
    "displayName": "🛡️ Caporal Garde",
    "branch": "securite"
  },
  {
    "excelName": "Soldat Garde",
    "displayName": "🛡️ Soldat Garde",
    "branch": "securite"
  },
  {
    "excelName": "🎖️ Commandant MTF",
    "displayName": "🎖️ Commandant MTF",
    "branch": "mtf"
  },
  {
    "excelName": "⚔️ Chef d'escouade MTF",
    "displayName": "⚔️ Chef d'escouade MTF",
    "branch": "mtf"
  },
  {
    "excelName": "🪖 Opérateur MTF",
    "displayName": "🪖 Opérateur MTF",
    "branch": "mtf"
  },
  {
    "excelName": "🔧 Spécialiste MTF",
    "displayName": "🔧 Spécialiste MTF",
    "branch": "mtf"
  },
  {
    "excelName": "📋 Recrue MTF",
    "displayName": "📋 Recrue MTF",
    "branch": "mtf"
  },
  {
    "excelName": "Superviseur d'Experience",
    "displayName": "🧪 Superviseur d'Expérience",
    "branch": "scientifique"
  },
  {
    "excelName": "Superviseur de SCP",
    "displayName": "☣️ Superviseur de SCP",
    "branch": "scientifique"
  },
  {
    "excelName": "Responsable d'Autorisation",
    "displayName": "📋 Responsable d'Autorisation",
    "branch": "scientifique"
  },
  {
    "excelName": "Chef d'Archive",
    "displayName": "📚 Chef d'Archive",
    "branch": "scientifique"
  },
  {
    "excelName": "Chef de Com.",
    "displayName": "📢 Chef de Com.",
    "branch": "scientifique"
  },
  {
    "excelName": "Scientifique Qualifier",
    "displayName": "🔬 Scientifique Qualifier",
    "branch": "scientifique"
  },
  {
    "excelName": "Scientifique Aguéris",
    "displayName": "🧬 Scientifique Aguerris",
    "branch": "scientifique"
  },
  {
    "excelName": "Scientifique Novice",
    "displayName": "📝 Scientifique Novice",
    "branch": "scientifique"
  },
  {
    "excelName": "Scientifique",
    "displayName": "〖🔬〗 Membre Scientifique",
    "branch": "scientifique"
  },
  {
    "excelName": "Chercheur Experimenter",
    "displayName": "🧪 Chercheur Expérimenteur",
    "branch": "scientifique"
  },
  {
    "excelName": "Chercheur Compétent",
    "displayName": "📖 Chercheur Compétent",
    "branch": "scientifique"
  },
  {
    "excelName": "Chercheur",
    "displayName": "Ch.D Chercheur Débutant",
    "branch": "scientifique"
  },
  {
    "excelName": "Archiviste",
    "displayName": "📁 Archiviste",
    "branch": "scientifique"
  },
  {
    "excelName": "Dr.",
    "displayName": "🥼 Dr.",
    "branch": "scientifique"
  },
  {
    "excelName": "Médecin / Psychologue",
    "displayName": "💊 Médecin / Psychologue",
    "branch": "scientifique"
  },
  {
    "excelName": "MEDECIN",
    "displayName": "🩹 Médecin",
    "branch": "scientifique"
  },
  {
    "excelName": "MEDECIN TERRAIN",
    "displayName": "🩹 Médecin terrain",
    "branch": "scientifique"
  },
  {
    "excelName": "M/C Dr.",
    "displayName": "⚕️ M/C Dr.",
    "branch": "scientifique"
  },
  {
    "excelName": "PSYCHOLOGUE",
    "displayName": "🧠 Psychologue",
    "branch": "scientifique"
  },
  {
    "excelName": "Responsable d'Entretien",
    "displayName": "🧹 Responsable d'Entretien",
    "branch": "maintenance"
  },
  {
    "excelName": "Responsable Livraison",
    "displayName": "📦 Responsable Livraison",
    "branch": "maintenance"
  },
  {
    "excelName": "Chef D'intervention",
    "displayName": "🚨 Chef D'intervention",
    "branch": "maintenance"
  },
  {
    "excelName": "Chef de Commande",
    "displayName": "📡 Chef de Commande",
    "branch": "maintenance"
  },
  {
    "excelName": "Com. de Maintenance",
    "displayName": "🔩 Com. de Maintenance",
    "branch": "maintenance"
  },
  {
    "excelName": "Chef Technicien",
    "displayName": "🔧 Chef Technicien",
    "branch": "maintenance"
  },
  {
    "excelName": "Technicien",
    "displayName": "🔨 Technicien",
    "branch": "maintenance"
  },
  {
    "excelName": "Plombier",
    "displayName": "🚿 Plombier",
    "branch": "maintenance"
  },
  {
    "excelName": "Electricien",
    "displayName": "⚡ Électricien",
    "branch": "maintenance"
  },
  {
    "excelName": "Mecanicien",
    "displayName": "🏍️ Mécanicien",
    "branch": "maintenance"
  },
  {
    "excelName": "Chef Receptionniste",
    "displayName": "📬 Chef Réceptionniste",
    "branch": "maintenance"
  },
  {
    "excelName": "Déménageur en Chef",
    "displayName": "📦 Déménageur en Chef",
    "branch": "maintenance"
  },
  {
    "excelName": "Travailleur",
    "displayName": "👷 Travailleur",
    "branch": "maintenance"
  },
  {
    "excelName": "Superviseur Secretaire",
    "displayName": "🗂️ Superviseur Secrétaire",
    "branch": "general"
  },
  {
    "excelName": "Superviseur Restauration",
    "displayName": "🍳 Superviseur Restauration",
    "branch": "general"
  },
  {
    "excelName": "Superviseur Nettoyage",
    "displayName": "🧽 Superviseur Nettoyage",
    "branch": "general"
  },
  {
    "excelName": "Superviseur Communication",
    "displayName": "📢 Superviseur Communication",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Admin.",
    "displayName": "🗂️ Secrétaire Admin.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Secu.",
    "displayName": "📋 Secrétaire Sécu.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Scient.",
    "displayName": "📄 Secrétaire Scient.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Medic",
    "displayName": "💊 Secrétaire Médic",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Maint.",
    "displayName": "🔧 Secrétaire Maint.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Adj. Admin.",
    "displayName": "📝 Secrétaire Adj. Admin.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Adj. Secu.",
    "displayName": "📝 Secrétaire Adj. Secu.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Adj. Scient.",
    "displayName": "📝 Secrétaire Adj. Scient.",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Adj. Medic",
    "displayName": "📝 Secrétaire Adj. Medic",
    "branch": "general"
  },
  {
    "excelName": "Secrétaire Adj. Maint.",
    "displayName": "📝 Secrétaire Adj. Maint.",
    "branch": "general"
  },
  {
    "excelName": "Chef de Cuisine",
    "displayName": "👨‍🍳 Chef de Cuisine",
    "branch": "general"
  },
  {
    "excelName": "Concierge",
    "displayName": "🧹 Concierge",
    "branch": "general"
  },
  {
    "excelName": "Com. Sécuriter",
    "displayName": "📣 Com. Sécurité",
    "branch": "general"
  },
  {
    "excelName": "Com. Scientifique",
    "displayName": "📣 Com. Scientifique",
    "branch": "general"
  },
  {
    "excelName": "Com. Maintenance",
    "displayName": "📣 Com. Maintenance",
    "branch": "general"
  },
  {
    "excelName": "Com. Extérieur",
    "displayName": "🌍 Com. Extérieur",
    "branch": "general"
  },
  {
    "excelName": "Com. Interne",
    "displayName": "🏠 Com. Interne",
    "branch": "general"
  },
  {
    "excelName": "🏅 Elite",
    "displayName": "🏅 Elite",
    "branch": "titres"
  },
  {
    "excelName": "⭐ Prestige",
    "displayName": "⭐ Prestige",
    "branch": "titres"
  },
  {
    "excelName": "Class - S",
    "displayName": "🔒 Class-S",
    "branch": "classes"
  },
  {
    "excelName": "Class - B",
    "displayName": "🔒 Class-B",
    "branch": "classes"
  },
  {
    "excelName": "Class - D",
    "displayName": "🔒 Class-D",
    "branch": "classes"
  },
  {
    "excelName": "🛡️ Président du Directoire",
    "displayName": "🛡️ Président du Directoire",
    "branch": "aegis"
  },
  {
    "excelName": "⚖️ Membre du Directoire",
    "displayName": "⚖️ Membre du Directoire",
    "branch": "aegis"
  },
  {
    "excelName": "🔍 Inspecteur principal",
    "displayName": "🔍 Inspecteur principal",
    "branch": "aegis"
  },
  {
    "excelName": "📋 Inspecteur adjoint",
    "displayName": "📋 Inspecteur adjoint",
    "branch": "aegis"
  },
  {
    "excelName": "📊 Analyste AEGIS",
    "displayName": "📊 Analyste AEGIS",
    "branch": "aegis"
  },
  {
    "excelName": "⚔️ Commandant de cellule",
    "displayName": "⚔️ Commandant de cellule",
    "branch": "aegis"
  },
  {
    "excelName": "👤 Agent d'application",
    "displayName": "👤 Agent d'application",
    "branch": "aegis"
  },
  {
    "excelName": "💚 Commandant de secteur",
    "displayName": "💚 Commandant de secteur",
    "branch": "chaos"
  },
  {
    "excelName": "⚔️ Officier du Chaos",
    "displayName": "⚔️ Officier du Chaos",
    "branch": "chaos"
  },
  {
    "excelName": "🔴 Chef de cellule",
    "displayName": "🔴 Chef de cellule",
    "branch": "chaos"
  },
  {
    "excelName": "🪖 Vétéran du Chaos",
    "displayName": "🪖 Vétéran du Chaos",
    "branch": "chaos"
  },
  {
    "excelName": "👤 Soldat Chaos",
    "displayName": "👤 Soldat Chaos",
    "branch": "chaos"
  },
  {
    "excelName": "〚🔍〛 Recrue Chaos",
    "displayName": "〚🔍〛 Recrue Chaos",
    "branch": "chaos"
  },
  {
    "excelName": "🐍 Grand Maître",
    "displayName": "🐍 Grand Maître",
    "branch": "serpent"
  },
  {
    "excelName": "🔮 Archimage",
    "displayName": "🔮 Archimage",
    "branch": "serpent"
  },
  {
    "excelName": "📿 Initié",
    "displayName": "📿 Initié",
    "branch": "serpent"
  },
  {
    "excelName": "🕯️ Acolyte",
    "displayName": "🕯️ Acolyte",
    "branch": "serpent"
  },
  {
    "excelName": "🌐 Directeur régional",
    "displayName": "🌐 Directeur régional",
    "branch": "goc"
  },
  {
    "excelName": "🤝 Officier de liaison",
    "displayName": "🤝 Officier de liaison",
    "branch": "goc"
  },
  {
    "excelName": "⚔️ Commandant d'unité",
    "displayName": "⚔️ Commandant d'unité",
    "branch": "goc"
  },
  {
    "excelName": "🪖 Soldat GOC",
    "displayName": "🪖 Soldat GOC",
    "branch": "goc"
  },
  {
    "excelName": "☣️ Technicien PSYCHE",
    "displayName": "☣️ Technicien PSYCHE",
    "branch": "goc"
  },
  {
    "excelName": "🧑 Citoyen REDLAKES",
    "displayName": "🧑 Citoyen REDLAKES",
    "branch": "civil"
  },
  {
    "excelName": "🆕 Nouvel arrivant",
    "displayName": "🆕 Nouvel arrivant",
    "branch": "civil"
  },
  {
    "excelName": "🎓 Étudiant / Stagiaire",
    "displayName": "🎓 Étudiant / Stagiaire",
    "branch": "civil"
  },
  {
    "excelName": "🏪 Propriétaire / Patron",
    "displayName": "🏪 Propriétaire / Patron",
    "branch": "civil"
  },
  {
    "excelName": "🍺 Employé bar & loisirs",
    "displayName": "🍺 Employé bar & loisirs",
    "branch": "civil"
  },
  {
    "excelName": "🛒 Employé commerce",
    "displayName": "🛒 Employé commerce",
    "branch": "civil"
  },
  {
    "excelName": "📰 Journaliste",
    "displayName": "📰 Journaliste",
    "branch": "civil"
  },
  {
    "excelName": "📺 Rédacteur / Médias",
    "displayName": "📺 Rédacteur / Médias",
    "branch": "civil"
  },
  {
    "excelName": "🏥 Directeur hôpital",
    "displayName": "🏥 Directeur hôpital",
    "branch": "civil"
  },
  {
    "excelName": "🩺 Médecin urgentiste",
    "displayName": "🩺 Médecin urgentiste",
    "branch": "civil"
  },
  {
    "excelName": "👨‍⚕️ Infirmier",
    "displayName": "👨‍⚕️ Infirmier",
    "branch": "civil"
  },
  {
    "excelName": "🚑 Paramedic / EMT",
    "displayName": "🚑 Paramedic / EMT",
    "branch": "civil"
  },
  {
    "excelName": "🚌 Chauffeur / Transit",
    "displayName": "🚌 Chauffeur / Transit",
    "branch": "civil"
  },
  {
    "excelName": "🔧 Technicien municipal",
    "displayName": "🔧 Technicien municipal",
    "branch": "civil"
  },
  {
    "excelName": "🏗️ Ouvrier municipal",
    "displayName": "🏗️ Ouvrier municipal",
    "branch": "civil"
  },
  {
    "excelName": "🏛️ Maire de REDLAKES",
    "displayName": "🏛️ Maire de REDLAKES",
    "branch": "gouvernement"
  },
  {
    "excelName": "📋 City Manager",
    "displayName": "📋 City Manager",
    "branch": "gouvernement"
  },
  {
    "excelName": "💼 Conseiller municipal",
    "displayName": "💼 Conseiller municipal",
    "branch": "gouvernement"
  },
  {
    "excelName": "📎 Attaché administratif",
    "displayName": "📎 Attaché administratif",
    "branch": "gouvernement"
  },
  {
    "excelName": "👤 Employé municipal",
    "displayName": "👤 Employé municipal",
    "branch": "gouvernement"
  },
  {
    "excelName": "🚔 Chief of Police",
    "displayName": "🚔 Chief of Police",
    "branch": "police"
  },
  {
    "excelName": "🎖️ Lieutenant",
    "displayName": "🎖️ Lieutenant",
    "branch": "police"
  },
  {
    "excelName": "👮 Police Officer",
    "displayName": "👮 Police Officer",
    "branch": "police"
  },
  {
    "excelName": "🔰 Deputy",
    "displayName": "🔰 Deputy",
    "branch": "police"
  },
  {
    "excelName": "🔍 Detective",
    "displayName": "🔍 Detective",
    "branch": "police"
  },
  {
    "excelName": "🕵️ Investigator",
    "displayName": "🕵️ Investigator",
    "branch": "police"
  },
  {
    "excelName": "💀 Gang Member",
    "displayName": "💀 Gang Member",
    "branch": "illegal"
  },
  {
    "excelName": "🔫 Gang Boss",
    "displayName": "🔫 Gang Boss",
    "branch": "illegal"
  },
  {
    "excelName": "🍝 Mafia Associate",
    "displayName": "🍝 Mafia Associate",
    "branch": "illegal"
  },
  {
    "excelName": "🎩 Mafia Don",
    "displayName": "🎩 Mafia Don",
    "branch": "illegal"
  },
  {
    "excelName": "🏍️ MC Member",
    "displayName": "🏍️ MC Member",
    "branch": "illegal"
  },
  {
    "excelName": "🏍️ MC President",
    "displayName": "🏍️ MC President",
    "branch": "illegal"
  },
  {
    "excelName": "💊 Cartel Runner",
    "displayName": "💊 Cartel Runner",
    "branch": "illegal"
  },
  {
    "excelName": "💊 Cartel Boss",
    "displayName": "💊 Cartel Boss",
    "branch": "illegal"
  },
  {
    "excelName": "🌃 Criminel indépendant",
    "displayName": "🌃 Criminel indépendant",
    "branch": "illegal"
  }
];

export const DISCORD_GRADE_SECTIONS: DiscordGradeSection[] = 
[
  {
    "separator": "━━━ 👑 CONSEIL OMEGA ━━━",
    "roles": [
      "👑 Président du Conseil (O1)",
      "🎖️ Vice-Président — Sécurité (O2)",
      "🔬 Conseiller — Sciences (O3)",
      "🔧 Conseiller — Maintenance (O4)",
      "📋 Conseiller — Services (O5)"
    ]
  },
  {
    "separator": "━━━ 🏛️ DIRECTION SITE-12 ━━━",
    "roles": [
      "🏛️ Directeur du Site",
      "📎 Adjoint-Directeur",
      "〖🔫〗 Directeur Sécurité",
      "〖🛡️〗 Adjoint-Directeur Sécurité",
      "〖🔬〗 Directeur Scientifique",
      "〖⚗️〗 Adjoint-Directeur Scientifique",
      "🩺 Directeur-Adjoint Médical",
      "🚑 Superviseur d'Intervention",
      "💉 Médecin en Chef",
      "💊 Chef de Com. en Soin",
      "〖🔧〗 Directeur Maintenance",
      "🛠️ Adjoint-Directeur Maintenance",
      "〖📋〗 Directeur Général",
      "📎 Adjoint-Directeur Général"
    ]
  },
  {
    "separator": "╰┈➤ 🔫 Branche Sécurité",
    "roles": [
      "⚔️ Commandant",
      "🎯 Commandant Patrouilles",
      "🎖️ Lieutenant de Terrain",
      "🔹 Lieutenant Sécurité",
      "👮 Responsable Garde D",
      "⭐ Général de Com.",
      "📚 Instructeur / Formateur",
      "⚔️ Sergent Elite",
      "🛡️ Caporal Elite",
      "👮 Soldat Elite",
      "⚔️ Sergent Prestige",
      "🛡️ Caporal Prestige",
      "👮 Soldat Prestige",
      "⚔️ Sergent",
      "🛡️ Caporal",
      "👮 Soldat",
      "🛡️ Caporal Garde",
      "🛡️ Soldat Garde"
    ]
  },
  {
    "separator": "╰┈➤ 🚁 Forces Mobiles (MTF)",
    "roles": [
      "🎖️ Commandant MTF",
      "⚔️ Chef d'escouade MTF",
      "🪖 Opérateur MTF",
      "🔧 Spécialiste MTF",
      "📋 Recrue MTF"
    ]
  },
  {
    "separator": "╰┈➤ 🔬 Branche Scientifique",
    "roles": [
      "🧪 Superviseur d'Expérience",
      "☣️ Superviseur de SCP",
      "📋 Responsable d'Autorisation",
      "📚 Chef d'Archive",
      "📢 Chef de Com.",
      "🔬 Scientifique Qualifier",
      "🧬 Scientifique Aguerris",
      "📝 Scientifique Novice",
      "〖🔬〗 Membre Scientifique",
      "🧪 Chercheur Expérimenteur",
      "📖 Chercheur Compétent",
      "Ch.D Chercheur Débutant",
      "📁 Archiviste",
      "🥼 Dr.",
      "💊 Médecin / Psychologue",
      "🩹 Médecin",
      "🩹 Médecin terrain",
      "⚕️ M/C Dr.",
      "🧠 Psychologue"
    ]
  },
  {
    "separator": "╰┈➤ 🔧 Branche Maintenance",
    "roles": [
      "🧹 Responsable d'Entretien",
      "📦 Responsable Livraison",
      "🚨 Chef D'intervention",
      "📡 Chef de Commande",
      "🔩 Com. de Maintenance",
      "🔧 Chef Technicien",
      "🔨 Technicien",
      "🚿 Plombier",
      "⚡ Électricien",
      "🏍️ Mécanicien",
      "📬 Chef Réceptionniste",
      "📦 Déménageur en Chef",
      "👷 Travailleur"
    ]
  },
  {
    "separator": "╰┈➤ 📋 Branche Générale",
    "roles": [
      "🗂️ Superviseur Secrétaire",
      "🍳 Superviseur Restauration",
      "🧽 Superviseur Nettoyage",
      "📢 Superviseur Communication",
      "🗂️ Secrétaire Admin.",
      "📋 Secrétaire Sécu.",
      "📄 Secrétaire Scient.",
      "💊 Secrétaire Médic",
      "🔧 Secrétaire Maint.",
      "📝 Secrétaire Adj. Admin.",
      "📝 Secrétaire Adj. Secu.",
      "📝 Secrétaire Adj. Scient.",
      "📝 Secrétaire Adj. Medic",
      "📝 Secrétaire Adj. Maint.",
      "👨‍🍳 Chef de Cuisine",
      "🧹 Concierge",
      "📣 Com. Sécurité",
      "📣 Com. Scientifique",
      "📣 Com. Maintenance",
      "🌍 Com. Extérieur",
      "🏠 Com. Interne"
    ]
  },
  {
    "separator": "━━━ 🏅 TITRES HONORIFIQUES ━━━",
    "roles": [
      "🏅 Elite",
      "⭐ Prestige"
    ]
  },
  {
    "separator": "━━━ ⛓️ PERSONNEL DÉTENU ━━━",
    "roles": [
      "🔒 Class-S",
      "🔒 Class-B",
      "🔒 Class-D"
    ]
  },
  {
    "separator": "━━━ 🛡️ A.E.G.I.S. ━━━",
    "roles": [
      "🛡️ Président du Directoire",
      "⚖️ Membre du Directoire",
      "🔍 Inspecteur principal",
      "📋 Inspecteur adjoint",
      "📊 Analyste AEGIS",
      "⚔️ Commandant de cellule",
      "👤 Agent d'application"
    ]
  },
  {
    "separator": "╰┈➤ 💚 Insurrection du Chaos",
    "roles": [
      "💚 Commandant de secteur",
      "⚔️ Officier du Chaos",
      "🔴 Chef de cellule",
      "🪖 Vétéran du Chaos",
      "👤 Soldat Chaos",
      "〚🔍〛 Recrue Chaos"
    ]
  },
  {
    "separator": "╰┈➤ 🐍 Main du Serpent",
    "roles": [
      "🐍 Grand Maître",
      "🔮 Archimage",
      "📿 Initié",
      "🕯️ Acolyte"
    ]
  },
  {
    "separator": "╰┈➤ 🌐 Global Occult Coalition",
    "roles": [
      "🌐 Directeur régional",
      "🤝 Officier de liaison",
      "⚔️ Commandant d'unité",
      "🪖 Soldat GOC",
      "☣️ Technicien PSYCHE"
    ]
  },
  {
    "separator": "━━━ 🏙️ CIVIL & VILLE (REDLAKES, USA) ━━━",
    "roles": [
      "🧑 Citoyen REDLAKES",
      "🆕 Nouvel arrivant",
      "🎓 Étudiant / Stagiaire",
      "🏪 Propriétaire / Patron",
      "🍺 Employé bar & loisirs",
      "🛒 Employé commerce",
      "📰 Journaliste",
      "📺 Rédacteur / Médias",
      "🏥 Directeur hôpital",
      "🩺 Médecin urgentiste",
      "👨‍⚕️ Infirmier",
      "🚑 Paramedic / EMT",
      "🚌 Chauffeur / Transit",
      "🔧 Technicien municipal",
      "🏗️ Ouvrier municipal"
    ]
  },
  {
    "separator": "━━━ 🏛️ GOUVERNEMENT MUNICIPAL ━━━",
    "roles": [
      "🏛️ Maire de REDLAKES",
      "📋 City Manager",
      "💼 Conseiller municipal",
      "📎 Attaché administratif",
      "👤 Employé municipal"
    ]
  },
  {
    "separator": "━━━ 🚔 REDLAKES POLICE DEPARTMENT ━━━",
    "roles": [
      "🚔 Chief of Police",
      "🎖️ Lieutenant",
      "👮 Police Officer",
      "🔰 Deputy",
      "🔍 Detective",
      "🕵️ Investigator"
    ]
  },
  {
    "separator": "━━━ 🌃 CRIME ORGANISÉ (GLOBAL) ━━━",
    "roles": [
      "💀 Gang Member",
      "🔫 Gang Boss",
      "🍝 Mafia Associate",
      "🎩 Mafia Don",
      "🏍️ MC Member",
      "🏍️ MC President",
      "💊 Cartel Runner",
      "💊 Cartel Boss",
      "🌃 Criminel indépendant"
    ]
  }
];

export const DISCORD_MEMBER_PING_ROLES_GENERATED: string[] = 
[
  "👥 Membre · Conseil Oméga",
  "👥 Membre · Direction Site-12",
  "👥 Membre · Branche Sécurité",
  "👥 Membre · Forces Mobiles",
  "👥 Membre · Branche Scientifique",
  "👥 Membre · Branche Maintenance",
  "👥 Membre · Branche Générale",
  "👥 Membre · Personnel détenu",
  "👥 Membre · A.E.G.I.S.",
  "👥 Membre · Insurrection du Chaos",
  "👥 Membre · Main du Serpent",
  "👥 Membre · G.O.C.",
  "📢 Réunion PATRON",
  "📢 Réunion COMMERCE",
  "📢 Réunion URGENCES",
  "📢 Réunion SERVICES",
  "📢 Réunion GOUVERNEMENT",
  "📢 Réunion POLICE",
  "📢 Réunion MÉDIAS",
  "📢 Réunion CRIME"
];
