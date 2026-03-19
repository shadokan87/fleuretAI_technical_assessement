import { marked, Token, Tokens } from "marked";
import type { Content, ContentText, ContentStack, ContentColumns } from "pdfmake/interfaces";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#2563eb",
  Info: "#6b7280",
};

// ── per-token converters ─────────────────────────────────────────────────────

function inlineTokensToText(tokens: Token[]): ContentText[] {
  const parts: ContentText[] = [];
  for (const tok of tokens) {
    if (tok.type === "text") {
      const t = tok as Tokens.Text;
      if (t.tokens && t.tokens.length) {
        parts.push(...inlineTokensToText(t.tokens));
      } else {
        parts.push({ text: t.text });
      }
    } else if (tok.type === "strong") {
      const t = tok as Tokens.Strong;
      parts.push({ text: inlineTokensToText(t.tokens ?? []), bold: true } as any);
    } else if (tok.type === "em") {
      const t = tok as Tokens.Em;
      parts.push({ text: inlineTokensToText(t.tokens ?? []), italics: true } as any);
    } else if (tok.type === "codespan") {
      const t = tok as Tokens.Codespan;
      parts.push({ text: t.text, fontSize: 9, background: "#f3f4f6" });
    } else if (tok.type === "link") {
      const t = tok as Tokens.Link;
      parts.push({
        text: t.text || t.href,
        color: "#2563eb",
        decoration: "underline",
        link: t.href,
      } as any);
    } else if (tok.type === "br") {
      parts.push({ text: "\n" });
    } else if ("raw" in tok) {
      parts.push({ text: (tok as any).raw });
    }
  }
  return parts;
}

function convertToken(tok: Token): Content | null {
  switch (tok.type) {
    case "heading": {
      const t = tok as Tokens.Heading;
      const depthSizes: Record<number, number> = { 1: 18, 2: 14, 3: 12, 4: 11, 5: 10, 6: 10 };
      const size = depthSizes[t.depth] ?? 10;
      return {
        text: inlineTokensToText(t.tokens ?? [{ type: "text", text: t.text, raw: t.text }]),
        fontSize: size,
        bold: true,
        margin: [0, t.depth <= 2 ? 10 : 6, 0, 4],
        color: t.depth === 1 ? "#111827" : "#1f2937",
      } as any;
    }

    case "paragraph": {
      const t = tok as Tokens.Paragraph;
      return {
        text: inlineTokensToText(t.tokens ?? [{ type: "text", text: t.text, raw: t.text }]),
        margin: [0, 0, 0, 6],
        lineHeight: 1.4,
      } as any;
    }

    case "blockquote": {
      const t = tok as Tokens.Blockquote;
      const inner = convertTokens(t.tokens ?? []);
      return {
        stack: inner,
        margin: [0, 4, 0, 4],
        padding: [8, 4, 8, 4],
        background: "#f9fafb",
        // left border illusion via column
      } as any;
    }

    case "code": {
      const t = tok as Tokens.Code;
      return {
        stack: [
          {
            text: t.text,
            fontSize: 8.5,
            lineHeight: 1.35,
            color: "#1f2937",
            background: "#f3f4f6",
            margin: [0, 4, 0, 4],
            padding: [8, 6, 8, 6],
          },
        ],
        margin: [0, 4, 0, 8],
      } as any;
    }

    case "list": {
      const t = tok as Tokens.List;
      const items = t.items.map((item) => {
        const body = convertTokens(
          item.tokens.filter((it) => it.type !== "list")
        );
        const nestedLists = item.tokens.filter((it) => it.type === "list");
        const nestedContent = nestedLists.map((n) => convertToken(n)).filter(Boolean) as Content[];
        return [...body, ...nestedContent];
      });

      return t.ordered
        ? ({ ol: items, margin: [0, 2, 0, 6], lineHeight: 1.4 } as any)
        : ({ ul: items, margin: [0, 2, 0, 6], lineHeight: 1.4 } as any);
    }

    case "hr":
      return { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#d1d5db" }], margin: [0, 6, 0, 6] } as any;

    case "space":
      return null;

    default:
      return null;
  }
}

function convertTokens(tokens: Token[]): Content[] {
  return tokens.map(convertToken).filter((c): c is Content => c !== null);
}

export function markdownToPdfmake(md: string): Content[] {
  const tokens = marked.lexer(md);
  return convertTokens(tokens as Token[]);
}

// ── severity badge helper ─────────────────────────────────────────────────────

export function severityBadge(severity: string): Content {
  const color = SEVERITY_COLORS[severity] ?? "#6b7280";
  return {
    text: severity.toUpperCase(),
    color: "#ffffff",
    background: color,
    fontSize: 8,
    bold: true,
    padding: [4, 2, 4, 2],
    margin: [0, 0, 0, 0],
  } as any;
}
