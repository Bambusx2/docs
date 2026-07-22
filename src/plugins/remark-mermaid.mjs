/**
 * Remark plugin: turn ```mermaid fenced code blocks into
 * `<pre class="mermaid">…</pre>` HTML nodes.
 *
 * Done at the remark (Markdown) stage — before Expressive Code processes code
 * blocks at the rehype stage — so Mermaid diagrams are handed off as raw HTML
 * and are NOT rendered as syntax-highlighted code. The client script in
 * Head.astro then renders each `.mermaid` element into an SVG in the browser.
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
            value: `<pre class="mermaid" data-mermaid-source="${escapeHtml(
              child.value
            )}">${escapeHtml(child.value)}</pre>`,
          };
        } else {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
