// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMermaid from './src/plugins/remark-mermaid.mjs';

// https://astro.build/config
export default defineConfig({
  // Convert ```mermaid blocks to `.mermaid` elements before Expressive Code
  // sees them; the client script in Head.astro renders them into SVG.
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  integrations: [
    starlight({
      title: 'Ingsoftware Docs',
      description: 'Customer documentation portal',
      customCss: ['@fontsource-variable/manrope', './src/styles/custom.css'],
      // Code blocks: dark-primary theme paired with a light one. The frame
      // chrome (radius, border, shadow) is refined in custom.css.
      expressiveCode: {
        themes: ['github-dark-default', 'github-light-default'],
        styleOverrides: {
          borderRadius: '0.65rem',
          codeFontFamily:
            "ui-monospace, 'SF Mono', 'JetBrains Mono', 'Cascadia Code', Menlo, Consolas, monospace",
        },
      },
      // Brand mark + comments live in component overrides:
      //  - SiteTitle: inline "ing" SVG (no per-navigation logo blink)
      //  - Footer: appends the per-page comments widget
      components: {
        // Head: enables client-side routing so navigation doesn't reload the
        // whole page (no FOUC / font-swap blink between pages).
        Head: './src/components/Head.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        Footer: './src/components/Footer.astro',
      },
      social: [
        { icon: 'external', label: 'Ingsoftware', href: 'https://www.ingsoftware.com' },
      ],
      // No sidebar config on purpose: Starlight auto-generates the sidebar
      // from the folder structure in src/content/docs/. Anyone can add a
      // Markdown file or folder there and it appears automatically —
      // no config changes ever needed. See HOW-TO-ADD-DOCS.md.
      // The portal is private: no need for public sitemap indexing.
      pagefind: true,
    }),
  ],
});
