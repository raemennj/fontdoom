# FontDoom

A deliberately ridiculous, genuinely useful **infinite font doom-scroller**.

Scroll open-source typefaces, edit preview text and size, favorite fonts, and keep scrolling forever.

- Catalog: public, keyless [Fontsource API](https://fontsource.org/docs/api/fonts), with hand-curated Google Fonts fallback.
- Font loading: [Fontsource CDN](https://fontsource.org/docs/getting-started/cdn) and Google Fonts fallback.
- Full-cycle Fisher–Yates shuffling: each font once before the entire catalog repeats in a different order, without revealing the seam.
- Virtualized rows: only a small viewport window is mounted at any time.
- Favorites: saved locally to your browser, not synced.
- Catalog cache: one day. No Gemini, no secret API keys, no AI required.

## Development

Node.js 20+:

    npm ci
    npm run dev
    npm run typecheck
    npm run build

No .env file needed.

## GitHub Pages

The workflow in .github/workflows/deploy.yml builds and deploys on pushes to main.
Select **Settings → Pages → Build and deployment → Source → GitHub Actions** once if necessary.

Expected URL: https://raemennj.github.io/fontdoom/

Check font licenses before redistribution. If you previously published a real Gemini API key, revoke/rotate it; deleting code doesn't invalidate an exposed key.
