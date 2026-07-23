/**
 * Remark plugin: turn ```mermaid fenced code blocks into
 * `<pre class="mermaid">…</pre>` HTML nodes.
 *
 * Done at the remark (Markdown) stage — before Expressive Code processes code
 * blocks at the rehype stage — so Mermaid diagrams are handed off as raw HTML
 * and are NOT rendered as syntax-highlighted code. The client script in
 * Head.astro reads each element's text content and renders it into an SVG.
 *
 * The diagram source lives in the element's TEXT CONTENT, not an attribute.
 * An earlier version stored it in `data-mermaid-source="…"`, but mermaid
 * sources contain double quotes (e.g. `subgraph x["Title"]`); when this raw
 * HTML was re-parsed by rehype, the quote closed the attribute early and
 * shredded the element. Text content round-trips quotes cleanly.
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function remarkMermaid() {
  return (tree) => {
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'code' && child.lang === 'mermaid') {
          node.children[i] = {
            type: 'html',
            value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`,
          };
        } else {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
