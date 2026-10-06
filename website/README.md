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

Standard crawlers only use `robots.txt` at the origin root: `https://justypixels.github.io/robots.txt`. It is published from the separate [account-level Pages repository](https://github.com/JustyPixels/JustyPixels.github.io), using the same content as `website/robots.txt`. The copy under `/fio-motion/` is provided for reference but cannot control crawling. When changing the policy, update both repositories and preserve other sites' rules and sitemap declarations. The account-level `llms.txt` points to this project's scoped documentation index.

Navigation and downloads are static HTML. Pages include skip links, semantic landmarks, visible keyboard focus, image descriptions and native video controls. Enhanced video playback stops offscreen and respects reduced-motion and data-saving preferences. Captions provide English explanations for the silent demonstration.

## Website review

Reviewed on October 6, 2026 at 375, 768, 1440 and 1920 pixels. Local Lighthouse 13.5.0 with its mobile preset scored 100 for performance, accessibility and SEO on both the homepage and guide. Results can vary with network and device conditions; automated accessibility checks do not replace testing with assistive technology.

On the published GitHub Pages site, the same Lighthouse mobile preset measured **97 performance / 100 accessibility / 100 SEO** for the homepage and **99 / 100 / 100** for the guide. Live checks confirmed the origin-level robots policy, sitemap, AI index, Markdown alternatives, guide and all four download destinations. Keyboard checks covered the visible skip link, its main-content focus destination and native FAQ disclosures. Eighteen local checks passed for release selection, failure handling, static navigation, discovery files and playback preferences.

The 1280×720 silent videos contain actual editor captures and native animation exports: a 12-second introduction (436,295 bytes) and a 40-second demonstration (623,079 bytes). The measured initial non-video transfer was below 1 MB. Release-selection and failure checks, local paths, playback preferences and the desktop build passed. Local tests, captures and raw reports remain excluded from Git.
