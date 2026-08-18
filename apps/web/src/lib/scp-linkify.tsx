import Link from "next/link";
import { Fragment } from "react";

/** Transforme les mentions "SCP-XXX" d'un texte en liens vers /wiki/scp-xxx. */
export function linkifyScpRefs(text: string, currentSlug?: string) {
  const parts = text.split(/(\bSCP-\d{3,4}\b)/g);
  return parts.map((part, i) => {
    const match = /^SCP-(\d{3,4})$/.exec(part);
    if (!match) return <Fragment key={i}>{part}</Fragment>;
    const slug = `scp-${match[1]}`;
    if (slug === currentSlug) return <Fragment key={i}>{part}</Fragment>;
    return (
      <Link
        key={i}
        href={`/wiki/${slug}`}
        className="text-redlake-glow underline decoration-dotted underline-offset-2 hover:text-white"
      >
        {part}
      </Link>
    );
  });
}
