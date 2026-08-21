"use client";

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";

/**
 * Rendu léger du sous-ensemble de markdown utilisé sur Discord (gras,
 * italique, souligné, barré, code, citations, titres, listes, spoilers) —
 * beaucoup de contenu RP est rédigé sur Discord avant d'être collé dans une
 * fiche du site, et affichait jusqu'ici les symboles bruts (**texte**) au
 * lieu du formatage. Pas de lib externe : le sous-ensemble Discord est petit
 * et bien défini, pas besoin d'un parseur CommonMark complet.
 *
 * `scpRefsSlug` active le linking des mentions "SCP-XXX" (ex. sur les fiches
 * du wiki) — un flag serialisable plutot qu'une fonction callback, ce
 * composant etant un Client Component : React interdit de passer une
 * fonction en prop depuis un Server Component (voir wiki/[id]/page.tsx, qui
 * est un Server Component).
 */

function Spoiler({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={() => setRevealed(true)}
      title={revealed ? undefined : "Cliquer pour révéler"}
      className={
        revealed
          ? "rounded bg-metal/30 px-1"
          : "cursor-pointer rounded bg-white px-1 text-white hover:bg-gray-300"
      }
    >
      <span className={revealed ? "" : "invisible"}>{children}</span>
    </span>
  );
}

const INLINE_PATTERN =
  /(\|\|(.+?)\|\||\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|`([^`]+?)`|\*(.+?)\*|_(.+?)_)/g;

const SCP_REF_PATTERN = /\b(SCP-\d{3,4})\b/g;

/** Transforme les mentions "SCP-XXX" en liens vers /wiki/scp-xxx (sauf la fiche courante) */
function linkifyScpRefsSegment(segment: string, currentSlug: string, keyPrefix: string): ReactNode {
  const parts = segment.split(SCP_REF_PATTERN);
  if (parts.length === 1) return segment;
  return parts.map((part, i) => {
    const match = /^SCP-(\d{3,4})$/.exec(part);
    if (!match) return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
    const slug = `scp-${match[1]}`;
    if (slug === currentSlug) return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
    return (
      <Link
        key={`${keyPrefix}-${i}`}
        href={`/wiki/${slug}`}
        className="text-redlake-glow underline decoration-dotted underline-offset-2 hover:text-white"
      >
        {part}
      </Link>
    );
  });
}

function renderInline(text: string, scpRefsSlug?: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const pushPlain = (segment: string) => {
    if (!segment) return;
    nodes.push(
      scpRefsSlug !== undefined
        ? <Fragment key={key++}>{linkifyScpRefsSegment(segment, scpRefsSlug, `sr${key}`)}</Fragment>
        : segment,
    );
  };

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) pushPlain(text.slice(lastIndex, index));

    const [, , spoiler, boldItalic, bold, underline, strike, code, italicStar, italicUnderscore] = match;
    if (spoiler !== undefined) {
      nodes.push(<Spoiler key={key++}>{spoiler}</Spoiler>);
    } else if (boldItalic !== undefined) {
      nodes.push(
        <strong key={key++}>
          <em>{boldItalic}</em>
        </strong>,
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>);
    } else if (underline !== undefined) {
      nodes.push(<u key={key++}>{underline}</u>);
    } else if (strike !== undefined) {
      nodes.push(<s key={key++}>{strike}</s>);
    } else if (code !== undefined) {
      nodes.push(
        <code key={key++} className="rounded bg-black/50 px-1 py-0.5 font-mono text-[0.9em] text-redlake-glow">
          {code}
        </code>,
      );
    } else if (italicStar !== undefined || italicUnderscore !== undefined) {
      nodes.push(<em key={key++}>{italicStar ?? italicUnderscore}</em>);
    }
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) pushPlain(text.slice(lastIndex));
  return nodes;
}

interface Block {
  type: "codeblock" | "quote" | "heading" | "list" | "paragraph" | "blank";
  content: string;
  level?: number;
}

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({ type: "codeblock", content: codeBuffer.join("\n") });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const quote = line.match(/^>\s?(.*)$/);
    const list = line.match(/^[-*]\s+(.*)$/);

    if (heading) {
      blocks.push({ type: "heading", content: heading[2], level: heading[1].length });
    } else if (quote) {
      blocks.push({ type: "quote", content: quote[1] });
    } else if (list) {
      blocks.push({ type: "list", content: list[1] });
    } else if (line.trim() === "") {
      blocks.push({ type: "blank", content: "" });
    } else {
      blocks.push({ type: "paragraph", content: line });
    }
  }

  if (inCodeBlock && codeBuffer.length) {
    blocks.push({ type: "codeblock", content: codeBuffer.join("\n") });
  }

  return blocks;
}

const HEADING_CLASSES: Record<number, string> = {
  1: "text-lg font-bold text-white mt-2",
  2: "text-base font-bold text-white mt-2",
  3: "text-sm font-bold text-white mt-2",
};

interface DiscordMarkdownProps {
  text: string;
  className?: string;
  /** Fiche SCP courante (ex. "scp-002") — active le linking des mentions SCP-XXX, en excluant l'auto-référence */
  scpRefsSlug?: string;
}

export function DiscordMarkdown({ text, className, scpRefsSlug }: DiscordMarkdownProps) {
  if (!text) return null;
  const blocks = parseBlocks(text);

  const elements: ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key++} className="ml-4 list-disc space-y-0.5">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item, scpRefsSlug)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  for (const block of blocks) {
    if (block.type === "list") {
      listBuffer.push(block.content);
      continue;
    }
    flushList();

    if (block.type === "codeblock") {
      elements.push(
        <pre key={key++} className="overflow-x-auto rounded border border-metal/40 bg-black/50 p-3 font-mono text-xs text-gray-300">
          <code>{block.content}</code>
        </pre>,
      );
    } else if (block.type === "quote") {
      elements.push(
        <p key={key++} className="border-l-2 border-redlake/40 pl-3 italic text-gray-400">
          {renderInline(block.content, scpRefsSlug)}
        </p>,
      );
    } else if (block.type === "heading") {
      elements.push(
        <p key={key++} className={HEADING_CLASSES[block.level ?? 3]}>
          {renderInline(block.content, scpRefsSlug)}
        </p>,
      );
    } else if (block.type === "blank") {
      elements.push(<Fragment key={key++} />);
    } else {
      elements.push(<Fragment key={key++}>{renderInline(block.content, scpRefsSlug)}{"\n"}</Fragment>);
    }
  }
  flushList();

  return <div className={className}>{elements}</div>;
}
