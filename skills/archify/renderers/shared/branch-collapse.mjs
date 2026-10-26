import { esc } from './utils.mjs';
import { throwDiagnosticProblems } from './diagnostics.mjs';
import { translateMessage as i18nText } from './i18n.mjs';

// Collapsible child nodes for graph diagrams (dataflow, architecture).
// A node that names a `parent` is a child: the viewer hides it, its relations
// and its labels while the parent is collapsed. Positions never depend on
// collapse state, so every check runs on the complete diagram and expanding a
// branch never moves what the reader already sees. The markup reuses the tree
// contract (data-tree-ui, data-tree-ancestors, data-tree-toggle) so the
// existing Archify.treeBranches viewer runtime drives it; export always writes
// the complete diagram.
export function nodeBranches(nodes, { diagramType, collection = 'nodes', locale }) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const problems = [];
  const details = [];
  const fail = (code, message, index, evidence, supportedFixes) => {
    problems.push(message);
    details.push({ code, severity: 'error', message, subject: { diagramType, path: `/${collection}/${index}/parent` }, evidence, supportedFixes });
  };
  const reportedCycles = new Set();
  nodes.forEach((node, index) => {
    if (node.parent === undefined) return;
    if (!byId.has(node.parent)) {
      fail(`${diagramType}/missing-parent`, `Node "${node.id}" names parent "${node.parent}", which is not declared.`, index,
        { parent: node.parent }, [`Declare a node with id "${node.parent}".`, 'Point parent at an existing node.', 'Remove parent.']);
      return;
    }
    const chain = [node.id];
    for (let current = byId.get(node.parent); current; current = byId.get(current.parent)) {
      if (chain.includes(current.id)) {
        const cycle = chain.slice(chain.indexOf(current.id));
        const key = [...cycle].sort().join('|');
        if (reportedCycles.has(key)) return;
        reportedCycles.add(key);
        fail(`${diagramType}/parent-cycle`, `Parent links form a cycle: ${[...chain, current.id].map((id) => `"${id}"`).join(' -> ')}.`, index,
          { cycle: chain }, ['Point one node in the cycle at a parent outside it, or remove its parent.']);
        return;
      }
      chain.push(current.id);
    }
  });
  if (problems.length) {
    throwDiagnosticProblems(`${diagramType} parent validation failed`, problems, { code: `${diagramType}/parent`, subject: { diagramType }, diagnostics: details });
  }

  const ancestorsOf = (id) => {
    const chain = [];
    for (let current = byId.get(byId.get(id)?.parent); current; current = byId.get(current.parent)) chain.push(current.id);
    return chain;
  };
  const descendantCount = (id) => nodes.filter((node) => ancestorsOf(node.id).includes(id)).length;
  const attr = (ids) => (ids.length ? ` data-tree-ancestors="${esc([...new Set(ids)].join(' '))}"` : '');
  const parents = nodes.filter((node) => nodes.some((child) => child.parent === node.id));
  const active = parents.length > 0;

  return {
    active,
    nodeAttrs: (id) => attr(ancestorsOf(id)),
    // A relation hides when either endpoint hides.
    edgeAttrs: (from, to) => attr([...ancestorsOf(from), ...ancestorsOf(to)]),
    svgAttrs: active ? ' data-tree-ui=""' : '',
    // Miro-style disc on the parent's bottom-right corner: minus while open,
    // plus and a hidden-count pill while collapsed.
    renderToggles(placed) {
      if (!active) return '';
      return parents.map((authored) => {
        const node = placed(authored.id);
        const count = descendantCount(authored.id);
        const collapse = i18nText(locale, 'tree.toggle.collapse', { label: authored.label, count });
        const expand = i18nText(locale, 'tree.toggle.expand', { label: authored.label, count });
        const cx = node.x + node.width;
        const cy = node.y + node.height;
        const r = 7;
        const arm = r * 0.45;
        const pillW = String(count).length * 6.2 + 11;
        return `        <g data-tree-toggle="${esc(authored.id)}" data-tree-count="${count}"${attr(ancestorsOf(authored.id))}${authored.collapsed ? ' data-tree-initially-collapsed=""' : ''} data-tree-label-collapse="${esc(collapse)}" data-tree-label-expand="${esc(expand)}" role="button" tabindex="0" aria-expanded="true" aria-label="${esc(collapse)}">
          <circle cx="${cx}" cy="${cy}" r="${r + 6}" class="branch-toggle-hit"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" class="branch-toggle-disc" stroke-width="1.2"/>
          <path class="branch-toggle-glyph" d="M ${cx - arm} ${cy} H ${cx + arm}" stroke-width="1.5" stroke-linecap="round"/>
          <path class="branch-toggle-glyph branch-toggle-plus" d="M ${cx} ${cy - arm} V ${cy + arm}" stroke-width="1.5" stroke-linecap="round"/>
          <g class="branch-toggle-count">
            <rect x="${cx + r + 3}" y="${cy - 7.5}" width="${pillW}" height="15" rx="7.5" class="branch-count-pill"/>
            <text x="${cx + r + 3 + pillW / 2}" y="${cy + 3.6}" font-size="10" font-weight="700" text-anchor="middle">${count}</text>
          </g>
        </g>`;
      }).join('\n');
    },
    style: active ? `        <style>
          svg[data-tree-ui] [data-tree-hidden] { display: none; }
          svg[data-tree-ui] g[data-tree-ancestors][data-node-id] { animation: branch-reveal 0.24s ease-out; transform-box: fill-box; transform-origin: center; }
          @keyframes branch-reveal { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: none; } }
          @media (prefers-reduced-motion: reduce) { svg[data-tree-ui] g[data-tree-ancestors][data-node-id] { animation: none; } }
          svg[data-tree-ui] [data-tree-toggle] { cursor: pointer; outline: none; }
          svg[data-tree-ui] .branch-toggle-hit { fill: transparent; }
          svg[data-tree-ui] .branch-toggle-disc { fill: var(--mask); stroke: var(--text-muted); transition: stroke 0.15s ease, fill 0.15s ease; }
          svg[data-tree-ui] .branch-toggle-glyph { stroke: var(--text-muted); fill: none; }
          svg[data-tree-ui] [data-tree-toggle]:is(:hover, :focus-visible) .branch-toggle-disc { stroke: var(--arrow-emphasis); stroke-width: 2; }
          svg[data-tree-ui] [data-tree-toggle][aria-expanded="true"] .branch-toggle-plus,
          svg[data-tree-ui] .branch-toggle-count { display: none; }
          svg[data-tree-ui] [data-tree-toggle][aria-expanded="false"] .branch-toggle-count { display: inline; }
          svg[data-tree-ui] [data-tree-toggle][aria-expanded="false"] .branch-toggle-disc { fill: var(--arrow-emphasis); stroke: var(--arrow-emphasis); }
          svg[data-tree-ui] [data-tree-toggle][aria-expanded="false"] .branch-toggle-glyph { stroke: var(--mask); }
          svg[data-tree-ui] .branch-count-pill { fill: var(--arrow-emphasis); }
          svg[data-tree-ui] .branch-toggle-count text { fill: var(--mask); }
        </style>` : '',
  };
}
