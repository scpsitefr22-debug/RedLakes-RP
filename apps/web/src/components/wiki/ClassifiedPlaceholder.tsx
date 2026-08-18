const LINE_WIDTHS = [92, 78, 85, 60, 95, 40];

/** Silhouette de texte caviardé pour un addendum dont le contenu réel n'a pas été envoyé par l'API. */
export function ClassifiedPlaceholder() {
  return (
    <div className="space-y-1.5 py-1">
      {LINE_WIDTHS.map((width, i) => (
        <div key={i} className="h-3 rounded-sm bg-zinc-300/90" style={{ width: `${width}%` }} />
      ))}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-redlake-glow/70">
        🔒 Contenu réservé à un département spécifique
      </p>
    </div>
  );
}
