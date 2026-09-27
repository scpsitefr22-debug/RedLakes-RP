package fr.redlakes.mc.queue;

/**
 * Que faire d'un envoi de la file selon la réponse du CORE. Java pur.
 * DELIVERED : accepté (ou déjà reçu : doublon reconnu par le CORE) → retiré.
 * REJECTED  : refus définitif (données invalides, compte non lié) → retiré,
 *             le joueur est prévenu ; renvoyer ne changerait rien.
 * RETRY     : panne, surcharge ou clé serveur invalide → gardé et renvoyé
 *             plus tard (une clé corrigée dans config.yml débloque la file).
 */
public enum DeliveryOutcome {
    DELIVERED, REJECTED, RETRY;

    public static DeliveryOutcome forStatus(int status) {
        if (status >= 200 && status < 300) {
            return DELIVERED;
        }
        if (status == 401 || status == 403 || status == 408 || status == 429 || status >= 500) {
            return RETRY;
        }
        return REJECTED;
    }
}
