---
name: visual-explanations
description: Creates compact visuals for architecture, process, tradeoffs, plans, bugs, and reviews. Use when asked for a diagram, visual explanation, or Excalidraw, or when a non-trivial explanation is clearer with one.
---

# Visual Explanations

Clarify the main question with the smallest readable visual. Skip factual one-liners and requests for no visual; default to one visual per response.

## Choose and build

Honor explicit tool or format requests. Otherwise choose the smallest readable option below and build it without asking the user to choose a renderer.

| Need | Use |
|---|---|
| Small, answer-local explanation | Markdown table or text flow |
| Diagram within the conversation | Pi's native Mermaid rendering first |
| SVG/HTML output, unsupported native diagram type, or layout the terminal cannot show clearly | Pele |
| Validated, explorable system-diagram deliverable | `archify`; follow its full workflow and do not replace its renderer with Pele |
| Editable canvas | Excalidraw |

- Match shape to purpose: table for tradeoffs or severity, flow for process, module map for structure, causal chain for bugs. Use option-specific previews for structured questions; add a canvas only when the whole-system view helps.
- Inspect evidence and use real domain names. For changes, inspect the diff and show affected boundaries, risk, and blast radius; visuals supplement diff notes.
- For current-versus-planned operations, show actual triggers and trace concrete incident examples. Mark unknown behavior rather than hiding it behind generic failure labels.

## Native Mermaid

- Use fenced `mermaid` blocks for `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, and `erDiagram`. Other types or diagrams the terminal cannot render clearly use Pele.
- Keep labels short without losing meaning. Prefer `TD` for long flowcharts. Put edge labels in pipes (`A -.->|text| B`); do not rely on `<br/>` for line breaks.
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
- Use restrained color only for meaning; pair it with words, symbols, or line styles. Omit unused mechanisms unless their absence is itself a decision. Avoid decoration and duplicated prose.

## Verify and share

1. For Excalidraw, open its URL once per task in a right-side cmux browser pane and reuse it:
   ```sh
   cmux new-pane --type browser --direction right --url "$EXCALIDRAW_URL" --focus false
   ```
   If cmux is unavailable, use the normal browser and report the fallback.
2. For native Mermaid, check the rendered terminal result for missing or truncated labels and relationships. A fenced source block alone does not prove rendering. If the terminal result cannot be inspected, say so rather than claiming visual validation.
3. For Pele or Excalidraw, fit the diagram and inspect a screenshot at normal size. Purpose, direction, start/end, and uncertainty must be clear. Check every label, including diamonds and callouts, for crowding or overflow. Fix and recapture until no text touches or crosses borders. Archify uses its own verification workflow.
4. Give a short explanation and saved path when applicable. Do not claim visual validation without inspecting the result.
