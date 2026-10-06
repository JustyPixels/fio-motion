# Fio Motion

A 2D animation editor for Windows, made by JustyPixels. Import your character's artwork, connect its arms, legs and accessories, then animate with puppet pins, bones and keyframes.

Fio Motion works offline. All features are unlocked, and no account is needed.

[Leia em português brasileiro](README.pt-BR.md)

## Download

[Get the installer or portable version](https://github.com/JustyPixels/fio-motion/releases). The `support.zip` download includes sample characters, guides and compatibility notes.

The current version is **1.0.0-rc.1**, a release candidate for testing. The executables are unsigned, so Windows may show a warning when you open them. See the [release notes](docs/RELEASE-NOTES.md) for known limitations and remaining checks.

## Using the editor

- **Rig:** import PNG, JPEG, WebP or PSD artwork, assemble your character and set up its joints. Connect the pieces yourself or use the humanoid assistant.
- **Animate:** create poses on the timeline, adjust motion curves and reuse animations. New keyframes use smooth easing by default.
- **Assemble:** arrange shots, add audio and camera moves, then export MP4 or transparent PNG sequences.

The canvas keeps your project's aspect ratio, including 16:9, 4:3, 1:1 and 9:16. The interface supports Brazilian Portuguese, English, Spanish, French, German, Japanese and Simplified Chinese.

Start with the fox example on the welcome screen, or follow the [quick-start guide](docs/quick-start/en.md). Projects use the `.puppet` format; files from earlier betas are still supported.

## Run from source

With Node.js installed:

```powershell
npm ci
npm start
```

The WebAssembly engine is included. See the [build guide](docs/BUILD.md) to rebuild it or create a Windows package. Video export also needs the FFmpeg files described in that guide.

## Found a bug?

[Open an issue](https://github.com/JustyPixels/fio-motion/issues) with the app version, your Windows version and steps to reproduce the problem. A screenshot or small example project helps, as long as it doesn't contain private artwork.

[Compatibility and limitations](docs/COMPATIBILITY.md) · [Architecture](docs/ARCHITECTURE.md) · [Third-party notices](THIRD-PARTY-NOTICES.txt)
