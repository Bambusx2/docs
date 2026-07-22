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
      title: 'Neopix Docs',
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
        { icon: 'external', label: 'Neopix', href: 'https://www.weareneopix.com' },
      ],
      // Explicit sidebar: clean section labels (no "01-"/"04-" folder-name
      // prefixes) and a fixed top-level order. Each section still autogenerates
      // its own pages from the folder, and README pages lead their section via
      // `sidebar.order: 1` frontmatter. To add a new top-level section, add a
      // line here; pages inside existing sections still appear automatically.
      sidebar: [
        { label: 'Overview', link: '/readme/' },
        { label: 'Product', autogenerate: { directory: 'product' } },
        { label: 'Constitution', autogenerate: { directory: '01-constitution' } },
        { label: 'Architecture', autogenerate: { directory: '02-architecture' } },
        { label: 'Data Model', autogenerate: { directory: '03-data' } },
        { label: 'Integrations', autogenerate: { directory: '04-integrations' } },
        { label: 'Feature Specs', autogenerate: { directory: '05-specs' } },
        { label: 'Engineering', autogenerate: { directory: '06-engineering' } },
        { label: 'Delivery Rules', link: '/agents/' },
        { label: 'Implementation Readiness', link: '/ready/' },
        { label: 'Changelog', link: '/changelog/' },
      ],
      // The portal is private: no need for public sitemap indexing.
      pagefind: true,
    }),
  ],
});
