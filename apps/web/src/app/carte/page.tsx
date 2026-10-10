import { redirect } from "next/navigation";

/**
 * La carte est un outil HRP réservé au staff (décision du fondateur,
 * 2026-10-10) : l'ancienne adresse publique renvoie vers la vue staff,
 * protégée par le garde de /staff.
 */
export default function CarteRedirect() {
  redirect("/staff/carte/vue");
}
