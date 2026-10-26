---
name: visual-explanations
description: Creates compact visuals for architecture, process, tradeoffs, plans, bugs, and reviews. Use when asked for a diagram, visual explanation, or Excalidraw, or when a non-trivial explanation is clearer with one.
---

# Visual Explanations

Clarify the main question. Skip factual one-liners and requests for no visual.

## Choose and build

Honor explicit tool or format requests. Otherwise choose the smallest readable option below and build it without asking the user to choose a renderer.

| Need | Use |
|---|---|
| Small, answer-local explanation | Markdown table or text flow |
| Diagram within the conversation | Pi's native Mermaid rendering first |
| SVG or simple HTML without a validated, explorable workflow; unsupported native type or unreadable terminal layout | Pele |
| Validated, explorable system-diagram deliverable | `archify`; follow its full workflow and do not replace its renderer with Pele |
| Editable canvas | Excalidraw |

- Pi displays Markdown tables, highlighted code blocks, links, and LaTeX math (as Unicode) directly; use these when a diagram is unnecessary.
- Use option-specific previews for structured questions.
- For code changes, inspect the diff and show affected boundaries, risk, and blast radius; visuals supplement diff notes.
- For current-versus-planned operations, show actual triggers and trace concrete incident examples.

## Native Mermaid

- Fenced `mermaid` blocks render as Unicode box diagrams for `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, and `erDiagram`. Unsupported types, grok-mermaid warnings, diagrams wider than the terminal, and diagrams in thinking show as source.
- Keep diagrams within the terminal width; aim below ~100 columns. Prefer `TD` for more than four nodes and keep labels short without losing meaning.
- Put flowchart edge labels in pipes (`A -.->|text| B`), never inline (`A -. "text" .-> B`): a `<` or `>` in an inline label can drop the edge. `<br/>` does not break lines. Node text wraps at 24 columns (four lines, then `…`); edge labels truncate at 28 characters.
- Fix warnings, width, and truncated labels before accepting the terminal result. Change layout, not meaning; use Pele if the diagram still cannot be shown clearly.

## Pele

- Use `render(source).svg` from `pele` for SVG output, or `mount(element, source)` for browser layout. See [API and theming](https://pele.run).
- Keep the Mermaid source with the output. Include any `--pele-*` theme variables in the saved artifact.
- Reuse an installed copy or an isolated workspace; do not add project dependencies just to create a diagram.

## Layout

- Set Excalidraw text to sans-serif (`fontFamily: 2`) unless handwriting is explicitly requested. If font family changes, resize or recreate affected text; old bounds are stale.
- Keep every label inside its node or panel with clear space at the edges. Shorten labels, add semantic line breaks, or enlarge nodes before reducing font size.
- Use one reading direction, clear primary flow, whitespace, and consistent alignment. Reserve nodes for entities, systems, decisions, or flow-changing steps; use badges or callouts for attributes and status. Merge repeated infrastructure.
- Keep labels to a noun and short qualifier where possible. For SVG or canvas output, keep fitted text legible: roughly 24+ for titles, 16+ for nodes, 13+ for annotations. Split dense diagrams rather than shrinking them.
- Use restrained color only for meaning; pair it with words, symbols, or line styles. Omit unused mechanisms unless their absence is itself a decision.

## Verify and share

1. For Excalidraw, open its URL once per task in a right-side cmux browser pane and reuse it:
   ```sh
   cmux new-pane --type browser --direction right --url "$EXCALIDRAW_URL" --focus false
   ```
   If cmux is unavailable, use the normal browser and report the fallback.
2. For native Mermaid, check the rendered terminal result for missing or truncated labels and relationships. A fenced source block alone does not prove rendering. If the terminal result cannot be inspected, say so rather than claiming visual validation.
3. For Pele or Excalidraw, fit the diagram and inspect a screenshot at normal size: `read` a PNG or call `excalidraw_capture_screenshot`. Purpose, direction, start/end, and uncertainty must be clear. Check every label, including diamonds and callouts, for crowding or overflow. Fix and recapture until no text touches or crosses borders. Do not claim visual validation without inspecting the result. Archify uses its own verification workflow.
