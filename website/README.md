# Fio Motion website

Static showcase and getting-started guide, hosted at https://justypixels.github.io/fio-motion/.

```powershell
npm run site:build
npm run site:preview
```

Local builds use the checked-in `release.json` snapshot and work offline. `node website/build.mjs` fetches release metadata, preferring the latest stable release and otherwise the newest published candidate. Missing assets, missing digests or failed requests fail the build before deployment. Update the snapshot after publishing a new candidate if you need a current offline preview.

Only `website/dist` is deployed. The desktop editor and installers use their existing build process. GitHub Actions publishes on website changes, published releases and manual runs. Pages must use **GitHub Actions** as its publishing source.

Curated screenshots and edited demonstrations are in `assets`; test captures, raw recordings and local validation results stay in ignored directories. Videos use actual Fio Motion captures and exported animation. No analytics or external fonts are added.

## Search and AI discovery

The build publishes `sitemap.xml` with the canonical homepage and guide URLs, `robots.txt`, and `llms.txt` with curated official documentation links. The homepage and guide expose Markdown alternatives through HTML discovery links. Release status and download links in the Markdown overview and `llms.txt` are generated from the same validated release manifest as the website. No crawler or AI tool is promised to index or recommend the project.

Standard crawlers only use `robots.txt` at the origin root: `https://justypixels.github.io/robots.txt`. The copy under `/fio-motion/` is provided for reference but cannot control crawling. To enable it, publish the same `website/robots.txt` in the account-level `JustyPixels.github.io` Pages repository. Keep other sites' rules and sitemap declarations when updating an existing origin-level file. The sitemap itself and the scoped `/fio-motion/llms.txt` work at this project URL.

Navigation and downloads are static HTML. Pages include skip links, semantic landmarks, visible keyboard focus, image descriptions and native video controls. Enhanced video playback stops offscreen and respects reduced-motion and data-saving preferences. Captions provide English explanations for the silent demonstration.

## Website review

Reviewed on October 6, 2026 at 375, 768, 1440 and 1920 pixels. Local Lighthouse 13.5.0 with its mobile preset scored 100 for performance, accessibility and SEO on both the homepage and guide. Results can vary with network and device conditions; automated accessibility checks do not replace testing with assistive technology.

The 1280×720 silent videos contain actual editor captures and native animation exports: a 12-second introduction (436,295 bytes) and a 40-second demonstration (623,079 bytes). The measured initial non-video transfer was below 1 MB. Release-selection and failure checks, local paths, playback preferences and the desktop build passed. Local tests, captures and raw reports remain excluded from Git.
