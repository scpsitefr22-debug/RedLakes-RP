import { Fragment, type ReactNode } from "react";

/**
 * Rendu léger du sous-ensemble de markdown utilisé sur Discord (gras,
 * italique, souligné, barré, code, citations, titres, listes) — beaucoup de
 * contenu RP est rédigé sur Discord avant d'être collé dans une fiche du
 * site, et affichait jusqu'ici les symboles bruts (**texte**) au lieu du
 * formatage. Pas de lib externe : le sous-ensemble Discord est petit et
 * bien défini, pas besoin d'un parseur CommonMark complet.
 */

const INLINE_PATTERN =
  /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|`([^`]+?)`|\*(.+?)\*|_(.+?)_)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const [, , boldItalic, bold, underline, strike, code, italicStar, italicUnderscore] = match;
    if (boldItalic !== undefined) {
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

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
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

export function DiscordMarkdown({ text, className }: { text: string; className?: string }) {
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
          <li key={i}>{renderInline(item)}</li>
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
          {renderInline(block.content)}
        </p>,
      );
    } else if (block.type === "heading") {
      elements.push(
        <p key={key++} className={HEADING_CLASSES[block.level ?? 3]}>
          {renderInline(block.content)}
        </p>,
      );
    } else if (block.type === "blank") {
      elements.push(<Fragment key={key++} />);
    } else {
      elements.push(<Fragment key={key++}>{renderInline(block.content)}{"\n"}</Fragment>);
    }
  }
  flushList();

  return <div className={className}>{elements}</div>;
}
