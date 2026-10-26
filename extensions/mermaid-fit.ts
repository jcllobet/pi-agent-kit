import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ExtensionAPI, Theme } from "@earendil-works/pi-coding-agent";
import { getPackageDir, SettingsManager } from "@earendil-works/pi-coding-agent";
import { Marked, type Token } from "@earendil-works/pi-tui";

// Pi's built-in Mermaid transformer shows the raw source, with no message, when
// the art is wider than the message area. A left-to-right flowchart with 5+ nodes
// is often 200+ columns wide. This transformer runs after the built-in one. For a
// Mermaid block that is still raw, it tries the other flowchart direction. If that
// fits, it draws the diagram. If not, it adds one line that gives the needed width.

type Cls = "border" | "text" | "edge" | "edgeLabel" | "title" | "none";
type Art = { width: number; plain: string[]; styled: { cls: Cls; text: string }[][]; warnings: string[] };
type Render = (src: string) => Art | null;

const HEADER = /^(\s*(?:flowchart|graph))(?:[ \t]+(LR|RL|TD|TB|BT)\b)?/m;
const markdownParser = new Marked();

function isMermaid(token: Token): token is Token & { text: string; raw: string } {
	return token.type === "code" && token.lang?.trim().split(/\s+/, 1)[0]?.toLowerCase() === "mermaid";
}

// Swap the flowchart direction: horizontal to vertical, vertical to horizontal.
function otherDirection(src: string): string | undefined {
	const match = HEADER.exec(src);
	if (!match) return undefined;
	const next = match[2] === "LR" || match[2] === "RL" ? "TD" : "LR";
	return src.replace(HEADER, `${match[1]} ${next}`);
}

// Same encoding as Pi's built-in mermaid.js: one inline code span per row.
function codeSpan(line: string): string {
	const content = line || "\u00a0";
	const longestBacktickRun = Math.max(0, ...Array.from(content.matchAll(/`+/g), (match) => match[0].length));
	const fence = "`".repeat(longestBacktickRun + 1);
	const padding = content.startsWith("`") || content.endsWith("`") ? " " : "";
	return `${fence}${padding}${content}${padding}${fence}`;
}

const COLORS = { border: "borderMuted", text: "text", edge: "accent", edgeLabel: "muted" } as const;

function themedLines(art: Art, theme: Theme | undefined): string[] {
	if (!theme) return art.plain;
	return art.styled.map((row) =>
		row
			.map((span) => {
				if (span.cls === "title") return theme.fg("accent", theme.bold(span.text));
				if (span.cls === "none") return span.text;
				return theme.fg(COLORS[span.cls], span.text);
			})
			.join(""),
	);
}

export default async function mermaidFit(pi: ExtensionAPI) {
	// Use the grok-mermaid copy that Pi itself uses, so both transformers agree.
	const entry = createRequire(join(getPackageDir(), "package.json")).resolve("grok-mermaid");
	const { render } = (await import(pathToFileURL(entry).href)) as { render: Render };

	let theme: Theme | undefined;
	let mode = "streaming";
	pi.on("session_start", (_event, ctx) => {
		theme = ctx.hasUI ? ctx.ui.theme : undefined;
		mode = SettingsManager.create(ctx.cwd).getMermaidRenderingMode();
	});

	const note = (text: string) => codeSpan(theme ? theme.fg("warning", text) : text);

	pi.registerMarkdownTransformer((markdown, context) => {
		if (mode === "off" || context.messageType === "assistant-thinking") return markdown;
		if (context.isStreaming && mode !== "streaming") return markdown;
		if (!markdown.includes("mermaid")) return markdown;

		return markdownParser
			.lexer(markdown)
			.map((token) => {
				if (!isMermaid(token)) return token.raw;
				const width = context.availableWidth;
				const art = render(token.text);
				// Not too wide: the built-in transformer already drew it or explained why not.
				if (!art || art.width <= width) return token.raw;

				const swapped = otherDirection(token.text);
				const alt = swapped ? render(swapped) : null;
				if (alt && alt.width <= width && (context.isStreaming || alt.warnings.length === 0)) {
					return `${themedLines(alt, theme).map(codeSpan).join("  \n")}\n`;
				}
				if (context.isStreaming) return token.raw;
				const reason =
					alt && alt.width <= width
						? alt.warnings[0]
						: `needs ${Math.min(art.width, alt?.width ?? Infinity)} columns, ${width} available`;
				return `${token.raw}\n${note(`Mermaid diagram not rendered: ${reason}`)}  \n`;
			})
			.join("");
	});
}
