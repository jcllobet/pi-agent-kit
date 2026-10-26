---
name: visual-explanations
description: Create shareable graphical diagrams or visuals that Pi's native terminal cannot show clearly. Use for SVG/HTML diagram deliverables, unsupported or unreadable native diagrams, validated explorable system diagrams, editable canvases, or explicit Pele, Archify, or Excalidraw requests. Not for routine terminal explanations, Markdown tables, or native Mermaid that already reads clearly.
---

# Visual Explanations

Use this skill for graphical artifacts to share or when the terminal cannot show the requested diagram clearly. Routine explanations inside Pi stay with the native Visuals guidance in `AGENTS.md`; do not create an artifact just because a diagram helps.

## Choose and build

Honor explicit tool or format requests. Otherwise choose the first matching row and build it without asking the user to choose a renderer.

| Need | Use |
|---|---|
| Validated, explorable system diagram with navigation, relationship tracing, or presentation controls | `archify`; follow its full workflow and do not replace its renderer with Pele |
| Editable or free-form canvas | Excalidraw |
| Any other graphical diagram: shareable SVG/simple HTML, unsupported native diagram type, or layout/labels the terminal cannot show clearly | Pele (default) |

A request for a diagram file or HTML alone does not require Archify. Create local artifacts; do not publish or send private source to a hosted service without explicit authorization.

## Pele

Use Pele for ordinary text-defined diagrams that need graphical output: a flowchart for a report, a sequence diagram to share, a chart Pi does not render, or a diagram whose full labels and layout cannot remain readable in the terminal. Pele renders Mermaid to SVG; it is not a codebase-exploration or validated system-diagram workflow.

- Use `render(source).svg` from `pele` for SVG files. For browser output, use `mount(element, source)` for font measurement, container fitting, resizing, supported automatic direction changes, and zoom. See [API and theming](https://pele.run).
- Keep the Mermaid source with the output. Preserve meaning; do not remove relationships or meaningful labels to make the diagram fit.
- Include `--pele-*` theme variables in the saved artifact. HTML must carry its required assets, not depend on a machine-specific installation path; use pre-rendered SVG or bundle the renderer when browser interaction is needed.
- Reuse an installed copy or an isolated workspace; do not add project dependencies just to create a diagram.

## Graphical layout

These rules apply to Pele and Excalidraw. Archify owns its own authoring, layout, and verification contracts.

- Set Excalidraw text to sans-serif (`fontFamily: 2`) unless handwriting is explicitly requested. If the font changes, resize or recreate affected text; old bounds are stale.
- Keep every label inside its node or panel with clear space at the edges. Shorten wording without losing meaning, add semantic line breaks, or enlarge nodes before reducing font size.
- Use one reading direction, a clear primary flow, whitespace, and consistent alignment. Reserve nodes for entities, systems, decisions, or flow-changing steps; use badges or callouts for attributes and status. Merge repeated infrastructure.
- Keep text legible: roughly 24+ px for titles, 16+ px for nodes, and 13+ px for annotations. Split dense diagrams rather than shrinking them.
- Use restrained color only for meaning; pair it with words, symbols, or line styles. Omit unused mechanisms unless their absence is itself a decision.

## Verify and share

For Archify, follow its full delivery and verification workflow instead of the steps below.

1. For Excalidraw, open its URL once per task in a right-side cmux browser pane and reuse it:
   ```sh
   cmux new-pane --type browser --direction right --url "$EXCALIDRAW_URL" --focus false
   ```
   If cmux is unavailable, use the normal browser and report the fallback.
2. For Pele or Excalidraw, fit the diagram and inspect a screenshot at normal size: `read` a PNG or call `excalidraw_capture_screenshot`. Purpose, direction, start/end, and uncertainty must be clear. Check labels, diamonds, callouts, arrows, contrast, and clipping. For responsive Pele HTML, check narrow and wide containers and resize behavior. Fix and recapture until no text touches or crosses borders.
3. Save the shareable artifact and its source. Give the artifact link and state any missing evidence or checks. Parsing alone is not visual validation; claim visual inspection only when performed.
