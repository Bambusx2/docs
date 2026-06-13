# How to add documentation (no technical skills needed)

Everything customers see lives in one folder:

```
src/content/docs/
```

**There is no configuration to edit. Ever.** The sidebar builds itself from the
folders and files you put there.

## Add a page in 3 steps

1. Open the folder `src/content/docs/` (on GitHub: navigate there and click
   **Add file → Create new file**).
2. Pick a section folder (e.g. `Guides`) or make a new folder by typing
   `My Section/my-page.md` as the file name.
3. Paste this at the very top of the file, then write normal text below it:

   ```
   ---
   title: My Page Title
   ---

   Your documentation text goes here. **Bold**, *italic*, lists, tables,
   images and links all work — it's plain Markdown.
   ```

That's it. The sidebar updates automatically:

- **Folder name** = section name in the sidebar (name folders nicely:
  `Guides`, `Billing`, `API`). The web address is always lowercase automatically.
- **`title:` line** = page name in the sidebar.

## Publish it

If the site is connected to Netlify (one-time setup by a developer):

1. Commit/save your change to the **main branch** → the live site updates
   itself in ~1 minute. Nothing else to do.
2. Or commit to **another branch** to get a separate preview link
   (`https://<branch-name>--<site-name>.netlify.app`) — useful for showing
   drafts. Same login protection applies.

## What link do I send the client?

The site address, e.g. `https://<site-name>.netlify.app` (or
`docs.ingsoftware.com` if a custom domain was set up) **plus the portal
password**. The client opens the link, types the password, and can read
everything for 7 days before being asked to sign in again.

## Rules of thumb

- One `.md` file = one page.
- Don't delete `index.mdx` (that's the landing page).
- The `title:` lines at the top of each file are required.
- Images: put the image file next to your `.md` file and reference it like
  `![description](./picture.png)`.
