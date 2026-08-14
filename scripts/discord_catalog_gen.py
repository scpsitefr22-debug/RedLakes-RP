"""Génère discord-master-catalog.generated.ts + DISCORD-GRADES-COMPLET.md depuis les grades Excel."""

from __future__ import annotations

import json
import re
import unicodedata
from typing import Any

BRANCH_SEPARATORS: dict[str, str] = {
    "omega": "━━━ 👑 CONSEIL OMEGA ━━━",
    "direction": "━━━ 🏛️ DIRECTION SITE-12 ━━━",
    "securite": "╰┈➤ 🔫 Branche Sécurité",
    "mtf": "╰┈➤ 🚁 Forces Mobiles (MTF)",
    "scientifique": "╰┈➤ 🔬 Branche Scientifique",
    "maintenance": "╰┈➤ 🔧 Branche Maintenance",
    "general": "╰┈➤ 📋 Branche Générale",
    "titres": "━━━ 🏅 TITRES HONORIFIQUES ━━━",
    "classes": "━━━ ⛓️ PERSONNEL DÉTENU ━━━",
    "aegis": "━━━ 🛡️ A.E.G.I.S. ━━━",
    "chaos": "╰┈➤ 💚 Insurrection du Chaos",
    "serpent": "╰┈➤ 🐍 Main du Serpent",
    "goc": "╰┈➤ 🌐 Global Occult Coalition",
    "civil": "━━━ 🏙️ CIVIL & VILLE (REDLAKES, USA) ━━━",
    "gouvernement": "━━━ 🏛️ GOUVERNEMENT MUNICIPAL ━━━",
    "police": "━━━ 🚔 REDLAKES POLICE DEPARTMENT ━━━",
    "illegal": "━━━ 🌃 CRIME ORGANISÉ (GLOBAL) ━━━",
}

SECTION_ORDER: list[str] = [
    "omega",
    "direction",
    "securite",
    "mtf",
    "scientifique",
    "maintenance",
    "general",
    "titres",
    "classes",
    "aegis",
    "chaos",
    "serpent",
    "goc",
    "civil",
    "gouvernement",
    "police",
    "illegal",
]

BRANCH_FIX: dict[str, str] = {
    "omega - o3": "omega",
    "omega - o4": "omega",
    "omega - o5": "omega",
    "omega - 03 a 05": "omega",
    "president du conseil (o1)": "omega",
    "vice-president-securite (o2)": "omega",
    "conseiller-sciences (o3)": "omega",
    "conseiller-maintenance (o4)": "omega",
    "conseiller-services (o5)": "omega",
    "superviseur de scp": "scientifique",
    "superviseur d'experience": "scientifique",
    "superviseur d'intervention": "scientifique",
    "responsable securiter": "securite",
    "responsable": "scientifique",
}

DISPLAY_OVERRIDES_RAW: dict[str, str] = {
    "GERANT OMEGA - O1": "👑 Président du Conseil (O1)",
    "GERANT OMEGA - 01": "👑 Président du Conseil (O1)",
    "ADJOINT OMEGA - O2": "🎖️ Vice-Président — Sécurité (O2)",
    "ADJOINT OMEGA - 02": "🎖️ Vice-Président — Sécurité (O2)",
    "OMEGA - O3": "🔬 Conseiller — Sciences (O3)",
    "OMEGA - O4": "🔧 Conseiller — Maintenance (O4)",
    "OMEGA - O5": "📋 Conseiller — Services (O5)",
    "OMEGA - 03 à 05": "📋 Conseiller — Services (O5)",
    "Président du Conseil (O1)": "👑 Président du Conseil (O1)",
    "Vice-Président — Sécurité (O2)": "🎖️ Vice-Président — Sécurité (O2)",
    "Conseiller — Sciences (O3)": "🔬 Conseiller — Sciences (O3)",
    "Conseiller — Maintenance (O4)": "🔧 Conseiller — Maintenance (O4)",
    "Conseiller — Services (O5)": "📋 Conseiller — Services (O5)",
    "directeur du site": "🏛️ Directeur du Site",
    "directeur branche": "📌 Directeur Branche",
    "adjoint-directeur": "📎 Adjoint-Directeur",
    "directeur securiter": "〖🔫〗 Directeur Sécurité",
    "adjoint-directeur se.": "〖🛡️〗 Adjoint-Directeur Sécurité",
    "commandant": "⚔️ Commandant",
    "commandant patrouilles": "🎯 Commandant Patrouilles",
    "lieutenant de terrain": "🎖️ Lieutenant de Terrain",
    "lieutenant securiter": "🔹 Lieutenant Sécurité",
    "general de com.": "⭐ Général de Com.",
    "generale de com.": "⭐ Général de Com.",
    "responsable garde d": "👮 Responsable Garde D",
    "instructeur / formateur": "📚 Instructeur / Formateur",
    "superviseur": "📒 Superviseur",
    "sergent": "⚔️ Sergent",
    "caporal": "🛡️ Caporal",
    "sergent elite": "⚔️ Sergent Elite",
    "caporal elite": "🛡️ Caporal Elite",
    "soldat elite": "👮 Soldat Elite",
    "sergent prestige": "⚔️ Sergent Prestige",
    "caporal prestige": "🛡️ Caporal Prestige",
    "soldat prestige": "👮 Soldat Prestige",
    "caporal garde": "🛡️ Caporal Garde",
    "soldat": "👮 Soldat",
    "soldat garde": "🛡️ Soldat Garde",
    "recrue": "〚🔍〛 Recrue",
    "directeur scientifique": "〖🔬〗 Directeur Scientifique",
    "adjoint-directeur sc.": "〖⚗️〗 Adjoint-Directeur Scientifique",
    "directeur-adjoint medical": "🩺 Directeur-Adjoint Médical",
    "medecin en chef": "💉 Médecin en Chef",
    "superviseur d'experience": "🧪 Superviseur d'Expérience",
    "superviseur de scp": "☣️ Superviseur de SCP",
    "superviseur d'intervention": "🚑 Superviseur d'Intervention",
    "responsable d'autorisation": "📋 Responsable d'Autorisation",
    "chef d'archive": "📚 Chef d'Archive",
    "chef de com.": "📢 Chef de Com.",
    "chef de com. en soin": "💊 Chef de Com. en Soin",
    "responsable": "〖⚗️〗 Responsable Scientifique",
    "scientifique qualifier": "🔬 Scientifique Qualifier",
    "scientifique agueris": "🧬 Scientifique Aguerris",
    "scientifique aguerris": "🧬 Scientifique Aguerris",
    "scientifique novice": "📝 Scientifique Novice",
    "scientifique": "〖🔬〗 Membre Scientifique",
    "chercheur experimenter": "🧪 Chercheur Expérimenteur",
    "chercheur competent": "📖 Chercheur Compétent",
    "chercheur": "Ch.D Chercheur Débutant",
    "archiviste": "📁 Archiviste",
    "dr.": "🥼 Dr.",
    "medecin / psychologue": "💊 Médecin / Psychologue",
    "medecin": "🩹 Médecin",
    "medecin terrain": "🩹 Médecin terrain",
    "psychologue": "🧠 Psychologue",
    "m/c dr.": "⚕️ M/C Dr.",
    "directeur maintenance": "〖🔧〗 Directeur Maintenance",
    "adjoint-directeur maint.": "🛠️ Adjoint-Directeur Maintenance",
    "responsable d'entretien": "🧹 Responsable d'Entretien",
    "responsable livraison": "📦 Responsable Livraison",
    "chef d'intervention": "🚨 Chef D'intervention",
    "chef de commande": "📡 Chef de Commande",
    "com. de maintenance": "🔩 Com. de Maintenance",
    "chef": "👷 Chef",
    "chef d'equipe": "👥 Chef d'équipe",
    "chef technicien": "🔧 Chef Technicien",
    "technicien": "🔨 Technicien",
    "plombier": "🚿 Plombier",
    "electricien": "⚡ Électricien",
    "mecanicien": "🏍️ Mécanicien",
    "chef receptionniste": "📬 Chef Réceptionniste",
    "demenageur en chef": "📦 Déménageur en Chef",
    "travailleur": "👷 Travailleur",
    "directeur generale": "〖📋〗 Directeur Général",
    "directeur general": "〖📋〗 Directeur Général",
    "adjoint-directeur-generale": "📎 Adjoint-Directeur Général",
    "adjoint-directeur general": "📎 Adjoint-Directeur Général",
    "superviseur secretaire": "🗂️ Superviseur Secrétaire",
    "superviseur restauration": "🍳 Superviseur Restauration",
    "superviseur nettoyage": "🧽 Superviseur Nettoyage",
    "superviseur communication": "📢 Superviseur Communication",
    "secretaire admin.": "🗂️ Secrétaire Admin.",
    "secretaire secu.": "📋 Secrétaire Sécu.",
    "secretaire scient.": "📄 Secrétaire Scient.",
    "secretaire medic": "💊 Secrétaire Médic",
    "secretaire maint.": "🔧 Secrétaire Maint.",
    "secretaire adj. admin.": "📝 Secrétaire Adj. Admin.",
    "secretaire adj. secu.": "📝 Secrétaire Adj. Secu.",
    "secretaire adj. scient.": "📝 Secrétaire Adj. Scient.",
    "secretaire adj. medic": "📝 Secrétaire Adj. Medic",
    "secretaire adj. maint.": "📝 Secrétaire Adj. Maint.",
    "com. securiter": "📣 Com. Sécurité",
    "com. scientifique": "📣 Com. Scientifique",
    "com. maintenance": "📣 Com. Maintenance",
    "com. exterieur": "🌍 Com. Extérieur",
    "com. interne": "🏠 Com. Interne",
    "chef de cuisine": "👨‍🍳 Chef de Cuisine",
    "concierge": "🧹 Concierge",
    "inspecteur": "🔍 Inspecteur",
    "class-s": "🔒 Class-S",
    "class-b": "🔒 Class-B",
    "class-d": "🔒 Class-D",
    "class - s": "🔒 Class-S",
    "class - b": "🔒 Class-B",
    "class - d": "🔒 Class-D",
}

def norm_key(value: str) -> str:
    return (
        unicodedata.normalize("NFD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
        .replace(" - ", "-")
        .replace("  ", " ")
        .strip()
    )


DISPLAY_OVERRIDES: dict[str, str] = {
    norm_key(k): v for k, v in DISPLAY_OVERRIDES_RAW.items()
}

DIRECTION_SKIP_KEYS = frozenset({"directeur branche"})

# Directeurs de branche listés sous DIRECTION (pas le rôle générique « Directeur Branche »)
BRANCH_DIRECTOR_KEYS = frozenset({
    "directeur securiter",
    "directeur scientifique",
    "directeur maintenance",
    "directeur generale",
    "directeur general",
})

BRANCH_ADJOINT_KEYS = frozenset({
    "adjoint-directeur se.",
    "adjoint-directeur sc.",
    "adjoint-directeur maint.",
    "adjoint-directeur-generale",
    "adjoint-directeur general",
})

MEDICAL_LEADERSHIP_KEYS = frozenset({
    "directeur-adjoint medical",
    "superviseur d'intervention",
    "medecin en chef",
    "chef de com. en soin",
})

DIRECTION_LEADERSHIP_KEYS = (
    BRANCH_DIRECTOR_KEYS
    | BRANCH_ADJOINT_KEYS
    | MEDICAL_LEADERSHIP_KEYS
    | frozenset({"adjoint-directeur"})
)

DIRECTION_SECTION_ORDER = [
    "directeur du site",
    "adjoint-directeur",
    "directeur securiter",
    "adjoint-directeur se.",
    "directeur scientifique",
    "adjoint-directeur sc.",
    "directeur-adjoint medical",
    "superviseur d'intervention",
    "medecin en chef",
    "chef de com. en soin",
    "directeur maintenance",
    "adjoint-directeur maint.",
    "directeur generale",
    "directeur general",
    "adjoint-directeur-generale",
    "adjoint-directeur general",
]

# Ordre strict des rôles Discord par branche (grilles Excel — pas le champ branch du parseur)
OMEGA_SECTION_ORDER = [
    "president du conseil (o1)",
    "vice-president securite (o2)",
    "conseiller sciences (o3)",
    "conseiller maintenance (o4)",
    "conseiller services (o5)",
]

SECURITE_SECTION_ORDER = [
    "commandant",
    "commandant patrouilles",
    "lieutenant de terrain",
    "lieutenant securiter",
    "responsable garde d",
    "general de com.",
    "generale de com.",
    "instructeur / formateur",
    "sergent elite",
    "caporal elite",
    "soldat elite",
    "sergent prestige",
    "caporal prestige",
    "soldat prestige",
    "sergent",
    "caporal",
    "soldat",
    "caporal garde",
    "soldat garde",
]

SCIENTIFIQUE_SECTION_ORDER = [
    "superviseur d'experience",
    "superviseur de scp",
    "responsable d'autorisation",
    "chef d'archive",
    "chef de com.",
    "scientifique qualifier",
    "scientifique agueris",
    "scientifique aguerris",
    "scientifique novice",
    "scientifique",
    "chercheur experimenter",
    "chercheur competent",
    "chercheur",
    "archiviste",
    "dr.",
    "medecin / psychologue",
    "medecin",
    "medecin terrain",
    "m/c dr.",
    "psychologue",
]

MAINTENANCE_SECTION_ORDER = [
    "responsable d'entretien",
    "responsable livraison",
    "chef d'intervention",
    "chef de commande",
    "com. de maintenance",
    "chef technicien",
    "technicien",
    "plombier",
    "electricien",
    "mecanicien",
    "chef receptionniste",
    "demenageur en chef",
    "travailleur",
]

GENERAL_SECTION_ORDER = [
    "superviseur secretaire",
    "superviseur restauration",
    "superviseur nettoyage",
    "superviseur communication",
    "secretaire admin.",
    "secretaire secu.",
    "secretaire scient.",
    "secretaire medic",
    "secretaire maint.",
    "secretaire adj. admin.",
    "secretaire adj. secu.",
    "secretaire adj. scient.",
    "secretaire adj. medic",
    "secretaire adj. maint.",
    "chef de cuisine",
    "concierge",
    "com. securiter",
    "com. scientifique",
    "com. maintenance",
    "com. exterieur",
    "com. interne",
]

CLASSES_SECTION_ORDER = [
    "class-s",
    "class - s",
    "class-b",
    "class - b",
    "class-d",
    "class - d",
]

# Clés alternatives si l'Excel utilise une variante du libellé
FOUNDATION_KEY_ALIASES: dict[str, list[str]] = {
    "general de com.": ["generale de com."],
    "generale de com.": ["general de com."],
    "scientifique agueris": ["scientifique aguerris"],
    "scientifique aguerris": ["scientifique agueris"],
    "class-s": ["class - s"],
    "class-b": ["class - b"],
    "class-d": ["class - d"],
}

ORDERED_BRANCH_SECTIONS: dict[str, list[str]] = {
    "omega": OMEGA_SECTION_ORDER,
    "securite": SECURITE_SECTION_ORDER,
    "scientifique": SCIENTIFIQUE_SECTION_ORDER,
    "maintenance": MAINTENANCE_SECTION_ORDER,
    "general": GENERAL_SECTION_ORDER,
    "classes": CLASSES_SECTION_ORDER,
}

OMEGA_DISCORD_SKIP = frozenset({
    "gerant omega-01",
    "adjoint omega-02",
    "omega-03 a 05",
})


def omega_rank(display_name: str) -> int:
    for i in range(1, 6):
        if f"(O{i})" in display_name:
            return i
    return 99

# Grades absents du parse Excel mais présents sur les grilles (secrétariat / maintenance)
MANUAL_EXTRAS: list[tuple[str, str, str]] = [
    ("Plombier", "maintenance", "🚿 Plombier"),
    ("Mecanicien", "maintenance", "🏍️ Mécanicien"),
    ("Scientifique Novice", "scientifique", "📝 Scientifique Novice"),
    ("Superviseur Secretaire", "general", "🗂️ Superviseur Secrétaire"),
    ("Superviseur Restauration", "general", "🍳 Superviseur Restauration"),
    ("Superviseur Nettoyage", "general", "🧽 Superviseur Nettoyage"),
    ("Superviseur Communication", "general", "📢 Superviseur Communication"),
    ("Secrétaire Medic", "general", "💊 Secrétaire Médic"),
    ("Secrétaire Maint.", "general", "🔧 Secrétaire Maint."),
    ("Secrétaire Adj. Medic", "general", "📝 Secrétaire Adj. Medic"),
    ("Secrétaire Adj. Maint.", "general", "📝 Secrétaire Adj. Maint."),
    ("Com. Extérieur", "general", "🌍 Com. Extérieur"),
    ("Com. Interne", "general", "🏠 Com. Interne"),
]

MTF_GRADES = [
    "🎖️ Commandant MTF",
    "⚔️ Chef d'escouade MTF",
    "🪖 Opérateur MTF",
    "🔧 Spécialiste MTF",
    "📋 Recrue MTF",
]

FACTION_GRADES: dict[str, list[str]] = {
    "aegis": [
        "🛡️ Président du Directoire",
        "⚖️ Membre du Directoire",
        "🔍 Inspecteur principal",
        "📋 Inspecteur adjoint",
        "📊 Analyste AEGIS",
        "⚔️ Commandant de cellule",
        "👤 Agent d'application",
    ],
    "chaos": [
        "💚 Commandant de secteur",
        "⚔️ Officier du Chaos",
        "🔴 Chef de cellule",
        "🪖 Vétéran du Chaos",
        "👤 Soldat Chaos",
        "〚🔍〛 Recrue Chaos",
    ],
    "serpent": [
        "🐍 Grand Maître",
        "🔮 Archimage",
        "📿 Initié",
        "🕯️ Acolyte",
    ],
    "goc": [
        "🌐 Directeur régional",
        "🤝 Officier de liaison",
        "⚔️ Commandant d'unité",
        "🪖 Soldat GOC",
        "☣️ Technicien PSYCHE",
    ],
    "civil": [
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
        "🏗️ Ouvrier municipal",
    ],
    "gouvernement": [
        "🏛️ Maire de REDLAKES",
        "📋 City Manager",
        "💼 Conseiller municipal",
        "📎 Attaché administratif",
        "👤 Employé municipal",
    ],
    "police": [
        "🚔 Chief of Police",
        "🎖️ Lieutenant",
        "👮 Police Officer",
        "🔰 Deputy",
        "🔍 Detective",
        "🕵️ Investigator",
    ],
}

ILLEGAL_GLOBAL_GRADES = [
    "💀 Gang Member",
    "🔫 Gang Boss",
    "🍝 Mafia Associate",
    "🎩 Mafia Don",
    "🏍️ MC Member",
    "🏍️ MC President",
    "💊 Cartel Runner",
    "💊 Cartel Boss",
    "🌃 Criminel indépendant",
]

MEMBER_PING_ROLES = [
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
    "📢 Réunion CRIME",
]

HONORARY_ROLES = ["🏅 Elite", "⭐ Prestige"]

TIER_SORT = {
    "omega": 0,
    "direction": 1,
    "officier": 2,
    "sous-officier": 3,
    "scientifique": 4,
    "medical": 5,
    "technique": 6,
    "admin": 7,
    "troupe": 8,
    "class": 9,
}


def is_honorary_grade(name: str) -> bool:
    n = norm_key(name)
    # Titres 🏅 Elite / ⭐ Prestige seuls — pas les grades TEAM (Sergent Elite…)
    if re.search(r"\b(sergent|caporal|soldat)\s+(elite|prestige)\b", n):
        return False
    return ("elite" in n or "prestige" in n) and "garde" not in n


def fix_branch(name: str, branch: str) -> str:
    k = norm_key(name)
    return BRANCH_FIX.get(k, branch)


def discord_display(excel_name: str, branch: str) -> str:
    k = norm_key(excel_name)
    if k in DISPLAY_OVERRIDES:
        return DISPLAY_OVERRIDES[k]
    prefix = {
        "omega": "👑",
        "direction": "🏛️",
        "securite": "🛡️",
        "scientifique": "🔬",
        "maintenance": "🔧",
        "general": "📋",
        "classes": "🔒",
        "mtf": "🚁",
    }.get(branch, "•")
    return f"{prefix} {excel_name}".strip()


def sort_grades(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def key(e: dict[str, Any]) -> tuple:
        tier = e.get("tier", "troupe")
        pay = e.get("pay") or 0
        return (TIER_SORT.get(tier, 50), -pay, norm_key(e["excelName"]))

    return sorted(entries, key=key)


def resolve_foundation_entry(
    foundation_by_key: dict[str, dict[str, Any]], key: str
) -> dict[str, Any] | None:
    if key in foundation_by_key:
        return foundation_by_key[key]
    for alt in FOUNDATION_KEY_ALIASES.get(key, []):
        if alt in foundation_by_key:
            return foundation_by_key[alt]
    return None


def build_section_from_order(
    order: list[str],
    foundation_by_key: dict[str, dict[str, Any]],
    branch: str,
) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    seen_display: set[str] = set()
    for key in order:
        entry = resolve_foundation_entry(foundation_by_key, key)
        if not entry:
            continue
        disp = entry["displayName"]
        if disp in seen_display:
            continue
        seen_display.add(disp)
        items.append({**entry, "branch": branch})
    return items


def build_discord_catalog(
    names: list[str],
    grades: dict[str, dict],
    normalize_fn,
) -> tuple[list[dict], list[dict], dict[str, str]]:
    """Retourne (foundation_grades, sections, display_map)."""
    foundation: list[dict[str, Any]] = []
    seen: set[str] = set()

    def add(excel_name: str, branch: str, display: str | None = None, meta: dict | None = None):
        k = norm_key(excel_name)
        if (
            not k
            or k in seen
            or k in OMEGA_DISCORD_SKIP
            or k in DIRECTION_SKIP_KEYS
            or is_honorary_grade(excel_name)
        ):
            return
        seen.add(k)
        g = meta or grades.get(normalize_fn(excel_name), {})
        branch = fix_branch(excel_name, g.get("branch", branch))
        disp = display or discord_display(excel_name, branch)
        foundation.append(
            {
                "excelName": excel_name,
                "displayName": disp,
                "branch": branch,
                "tier": g.get("tier", "troupe"),
                "pay": g.get("pay"),
            }
        )

    for name in names:
        g = grades.get(normalize_fn(name), {})
        add(name, g.get("branch", "general"), meta=g)

    for excel_name, branch, display in MANUAL_EXTRAS:
        add(excel_name, branch, display)

    foundation_by_key = {norm_key(e["excelName"]): e for e in foundation}
    by_section: dict[str, list[dict]] = {s: [] for s in SECTION_ORDER}

    by_section["direction"] = build_section_from_order(
        DIRECTION_SECTION_ORDER, foundation_by_key, "direction"
    )
    for section_id, order in ORDERED_BRANCH_SECTIONS.items():
        by_section[section_id] = build_section_from_order(
            order, foundation_by_key, section_id
        )

    for role in MTF_GRADES:
        by_section["mtf"].append(
            {"excelName": role, "displayName": role, "branch": "mtf", "tier": "officier", "pay": None}
        )

    for section_id, roles in FACTION_GRADES.items():
        for role in roles:
            by_section[section_id].append(
                {
                    "excelName": role,
                    "displayName": role,
                    "branch": section_id,
                    "tier": "troupe",
                    "pay": None,
                }
            )

    for role in ILLEGAL_GLOBAL_GRADES:
        by_section["illegal"].append(
            {"excelName": role, "displayName": role, "branch": "illegal", "tier": "troupe", "pay": None}
        )

    for role in HONORARY_ROLES:
        by_section["titres"].append(
            {"excelName": role, "displayName": role, "branch": "titres", "tier": "omega", "pay": None}
        )

    sections: list[dict] = []
    flat_foundation: list[dict] = []

    for section_id in SECTION_ORDER:
        sep = BRANCH_SEPARATORS.get(section_id)
        if not sep:
            continue
        items = by_section.get(section_id, [])
        if not items and section_id not in ("titres",):
            continue
        ordered_sections = frozenset(ORDERED_BRANCH_SECTIONS) | frozenset({"direction"})
        sorted_items = (
            sort_grades(items)
            if section_id not in FACTION_GRADES and section_id not in ordered_sections
            and section_id not in ("mtf", "illegal")
            else items
        )
        if section_id == "omega":
            sorted_items = sorted(sorted_items, key=lambda i: omega_rank(i["displayName"]))
        deduped_items: list[dict] = []
        seen_display: set[str] = set()
        for item in sorted_items:
            disp = item["displayName"]
            if disp in seen_display:
                continue
            seen_display.add(disp)
            deduped_items.append(item)
        role_names = [i["displayName"] for i in deduped_items]
        sections.append({"separator": sep, "roles": role_names})
        flat_foundation.extend(deduped_items)

    display_map: dict[str, str] = {}
    for entry in flat_foundation:
        display_map[entry["excelName"]] = entry["displayName"]

    return flat_foundation, sections, display_map


def render_discord_master_ts(
    foundation: list[dict],
    sections: list[dict],
    display_map: dict[str, str],
    source: str,
) -> str:
    lines = [
        "/**",
        " * CATALOGUE DISCORD — genere automatiquement",
        f" * Source : {source}",
        " * Regenerer : python scripts/generate-rp-catalog.py",
        " * Site + bot + API synchronises via le meme Excel.",
        " */",
        "",
        "export type DiscordBranch =",
        '  | "omega" | "direction" | "securite" | "scientifique"',
        '  | "maintenance" | "general" | "classes" | "mtf"',
        '  | "titres" | "aegis" | "chaos" | "serpent" | "goc"',
        '  | "civil" | "gouvernement" | "police" | "illegal";',
        "",
        "export interface DiscordFoundationGrade {",
        "  excelName: string;",
        "  displayName: string;",
        "  branch: DiscordBranch | string;",
        "}",
        "",
        "export interface DiscordGradeSection {",
        "  separator: string;",
        "  roles: string[];",
        "  note?: string;",
        "}",
        "",
        "export const GRADE_DISPLAY_NAMES: Record<string, string> = ",
        json.dumps(display_map, ensure_ascii=False, indent=2) + ";",
        "",
        "export const DISCORD_FOUNDATION_GRADES: DiscordFoundationGrade[] = ",
        json.dumps(
            [
                {
                    "excelName": f["excelName"],
                    "displayName": f["displayName"],
                    "branch": f["branch"],
                }
                for f in foundation
            ],
            ensure_ascii=False,
            indent=2,
        )
        + ";",
        "",
        "export const DISCORD_GRADE_SECTIONS: DiscordGradeSection[] = ",
        json.dumps(sections, ensure_ascii=False, indent=2) + ";",
        "",
        "export const DISCORD_MEMBER_PING_ROLES_GENERATED: string[] = ",
        json.dumps(MEMBER_PING_ROLES, ensure_ascii=False, indent=2) + ";",
        "",
    ]
    return "\n".join(lines)


def render_discord_md(sections: list[dict], source: str) -> str:
    lines = [
        "# Grades Discord REDLAKES — liste complète",
        "",
        f"> Généré depuis **{source}**. Régénérer : `python scripts/generate-rp-catalog.py`",
        "",
        "Crée les rôles **du haut vers le bas**, sous chaque séparateur.",
        "Les rôles **👥 Membre ·** et **📢 Réunion** sont mentionnables pour @ping groupé.",
        "",
        "---",
        "",
    ]
    for sec in sections:
        lines.append(f"## {sec['separator']}")
        lines.append("")
        if sec.get("note"):
            lines.append(f"*{sec['note']}*")
            lines.append("")
        if sec["roles"]:
            for r in sec["roles"]:
                lines.append(f"- `{r}`")
        else:
            lines.append("- *(aucun rôle fixe)*")
        lines.append("")

    lines.extend(
        [
            "---",
            "",
            "## Rôles ping & réunions (mentionnables)",
            "",
        ]
    )
    for r in MEMBER_PING_ROLES:
        lines.append(f"- `{r}`")
    lines.extend(
        [
            "",
            "## Crime organisé",
            "",
            "Rôles **globaux** — pas de création par org (gang/mafia/MC/cartel).",
            "Les joueurs fondent leur lore en RP ; le staff attribue le grade adapté.",
            "",
        ]
    )
    for r in ILLEGAL_GLOBAL_GRADES:
        lines.append(f"- `{r}`")
    lines.extend(BRANCH_ORG_APPENDIX)
    lines.append("")
    return "\n".join(lines)


BRANCH_ORG_APPENDIX = [
    "",
    "---",
    "",
    "## Organigramme branches (Excel — pas des rôles Discord)",
    "",
    "Les **TEAM / EXPERIENCE / EQUIPE** sont des compositions RP, pas des rôles à créer.",
    "Seuls les **grades** listés plus haut deviennent des rôles Discord.",
    "",
    "### 🔫 Sécurité — patrouilles",
    "",
    "| Responsable (grade) | Équipe | Composition |",
    "|---|---|---|",
    "| Directeur Sécurité | TEAM ELITE : 02 | Sergent/Caporal/Soldat Elite ×3 + M/C Dr. |",
    "| Adjoint-Directeur Sécu. | TEAM PRESTIGE : 01 | Sergent/Caporal/Soldat Prestige ×3 + M/C Dr. |",
    "| Commandant | TEAM PRESTIGE : 03 | Sergent/Caporal/Soldat Prestige ×3 + M/C Dr. |",
    "| Commandant Patrouilles | TEAM NORMAL : 01 | Sergent, Caporal, Soldat ×3 + M/C Dr. |",
    "| Lieutenant de Terrain | TEAM NORMAL : 02 | Sergent, Caporal, Soldat ×3 |",
    "| Lieutenant Sécurité | TEAM NORMAL : 03 | Sergent, Caporal, Soldat ×3 |",
    "| Responsable Garde D | TEAM GARDE : 01 | Caporal Garde, Soldat Garde ×3 |",
    "| Général de Com. | TEAM GARDE : 02 | Caporal Garde, Soldat Garde ×3 |",
    "| Instructeur / Formateur | TEAM GARDE : 03 | Caporal Garde, Soldat Garde ×3 |",
    "",
    "### 🔬 Scientifique — expériences",
    "",
    "| Superviseur (grade) | Expérience | Composition |",
    "|---|---|---|",
    "| Directeur Scientifique | KETER : 01 | Scientifique Qualifier ×2, Aguerris, Expérimenteur, Archiviste |",
    "| Adjoint-Directeur Sc. | KETER : 02 | Scientifique ×3, Chercheur |",
    "| Superviseur d'Expérience | EUCLID : 01–03 | Scientifique Aguerris ×2, Compétent, Archiviste |",
    "| Superviseur de SCP | *(voir Excel)* | *(voir Excel)* |",
    "| Chef d'Archive / Chef de Com. | SAFE : 01–04 | Scientifique Novice ×2, Chercheur, Archiviste |",
    "",
    "### 🩺 Médical — équipes mobiles",
    "",
    "| Responsable (grade) | Unité | Composition |",
    "|---|---|---|",
    "| Directeur-Adjoint Médical | TEAM MOBILE : 01 | M/C Dr., Dr., Médecin ×2 |",
    "| Superviseur d'Intervention | TEAM MOBILE : 03 | M/C Dr., Dr., Médecin ×2 |",
    "| Médecin en Chef | TEAM MOBILE : 02 | M/C Dr., Dr., Médecin ×2 |",
    "| Chef de Com. en Soin | MEDECIN | Médecin ×3 |",
    "| *(grade)* | PSYCHOLOGUE | Psychologue ×3 |",
    "",
    "### 🔧 Maintenance — équipes",
    "",
    "| Responsable (grade) | Équipe | Composition |",
    "|---|---|---|",
    "| Directeur Maintenance | EQUIPE ENTRETIEN | Chef Technicien, Technicien, Plombier, Électricien, Mécanicien |",
    "| Responsable d'Entretien | EQUIPE LIVRAISON | Chef Réceptionniste, Travailleur ×2 |",
    "| Responsable Livraison | *(livraison)* | *(voir Excel)* |",
    "| Chef D'intervention | EQUIPE DEPLACEMENT | Déménageur en Chef, Travailleur ×2 |",
    "| Chef de Commande / Com. Maint. | EQUIPE COMMANDE | Chef de Commande ×3 |",
    "",
    "### 📋 Général — secrétariat (5 branches)",
    "",
    "Colonnes Excel : **Admin · Sécu · Scient · Médic · Maint**",
    "",
    "- Superviseur Secrétaire → Secrétaire + Secrétaire Adj. (×5 branches)",
    "- Superviseur Restauration → Chef de Cuisine (×5)",
    "- Superviseur Nettoyage → Concierge (×5)",
    "- Superviseur Communication → Com. Sécurité / Scientifique / Maintenance / Extérieur / Interne",
    "",
]
