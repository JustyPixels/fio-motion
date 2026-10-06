# Fio Motion — Bring your artwork to life

Fio Motion is a free, offline 2D animation editor for Windows by JustyPixels. Connect your artwork, pose your character and animate it with smooth keyframes.

- [Website and genuine editor demonstrations](https://justypixels.github.io/fio-motion/)
- [Getting started](https://justypixels.github.io/fio-motion/guide/index.md)
- [Source repository](https://github.com/JustyPixels/fio-motion)

## Current release

Version: **__VERSION__** — __RELEASE_STATUS__.

__RELEASE_QUALIFICATION__ __SIGNING_STATUS__ Read the [release notes](__RELEASE_URL__) before installing. Existing candidate binaries and checksums are unchanged by the website publication.

__MARKDOWN_DOWNLOADS__

The [download manifest](https://justypixels.github.io/fio-motion/downloads.json) includes each asset's SHA256 checksum. Compare downloads against the supplied checksums. The installer installs the app; the portable executable can be run without installation. The support archive contains examples and documentation. All features are unlocked in the current candidate.

## Rig, Animate and Assemble

**Rig:** Import artwork as separate layers. Connect pieces to layers, pins or bones, or use the humanoid assistant. Shared skeletons support whole and segmented limbs. Connections stay separate from drawing order.

**Animate:** Place puppet controls, create poses and keyframes, and edit Bézier timing curves. New movement keys use smooth easing by default. Timing curves change speed; spatial paths change the route. Auto-key is clearly indicated, and rig edits do not create animation keyframes.

**Assemble:** Arrange shots, add WAV or MP3 audio and camera moves, and export MP4 or transparent PNG sequences. Preview and export use the same animation evaluation pipeline.

The viewer preserves project proportions, including 16:9, 4:3, square, portrait and custom dimensions. The app supports English, Brazilian Portuguese, Spanish, French, German, Japanese and simplified Chinese.

## Requirements and compatibility

Distributed builds target Windows 11 x64. The editor needs a WebGL2-capable GPU. Editing and export work offline; update checks are optional. Clean Windows 11 qualification and reference-hardware performance testing remain pending for the current candidate. Measured results and known limitations belong in the release notes.

Artwork import supports PNG, JPEG, WebP and supported 8-bit RGB PSD documents. Supported PSD layers, names, groups and offsets are preserved. Unsupported Photoshop features are reported; full Photoshop compatibility is not promised. See the [compatibility notes](https://github.com/JustyPixels/fio-motion/blob/main/docs/COMPATIBILITY.md).

Projects use .puppet files with managed artwork/audio folders. Supported earlier beta projects migrate without automatically converting connected rigs to the new shared skeleton. Keep assets beside the project, or use Collect project for a portable archive.

## Commercial use, support and privacy

You own your artwork and animation. Fio Motion's original code is MIT-licensed, permitting personal and commercial use, modification and distribution under the license's notice requirements. Third-party dependencies keep their own licenses. See the [MIT license](https://github.com/JustyPixels/fio-motion/blob/main/LICENSE) and [third-party notices](https://github.com/JustyPixels/fio-motion/blob/main/THIRD-PARTY-NOTICES.md).

Report reproducible problems in the [issue tracker](https://github.com/JustyPixels/fio-motion/issues), including the app version, Windows version and steps to reproduce. Do not publish private artwork in bug reports.

The website adds no analytics or external fonts. It is hosted on GitHub Pages, subject to [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
