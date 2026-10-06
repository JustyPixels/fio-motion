# Building Fio Motion

## Development

Use Windows x64 and a Node.js version supported by Vite 8 (22.12 or newer). From the project directory:

```powershell
npm ci
npm start
```

If your npm settings blocked Electron's installation script, run `node node_modules/electron/install.js` before starting.

`npm run build` builds the editor. The repository includes `public/engine/puppet_engine.wasm`, used by the deformation worker. To rebuild it, install Rust and its WebAssembly target:

```powershell
rustup target add wasm32-unknown-unknown
npm run build:wasm
```

## FFmpeg and video export

FFmpeg executables and shared libraries are excluded from Git. To enable export and audio processing during development, copy `resources/ffmpeg` from a Fio Motion installation into `vendor/ffmpeg-minimal`. Keep the `bin` directory, license files and `sources` directory together. Windows packaging uses the same directory.

You can also rebuild the encoder. [build-encoder.sh](../scripts/build-encoder.sh) records the candidate's configuration; the [encoder notice](../vendor/ffmpeg-minimal/README.md) lists dependency versions. The script uses MSYS2 UCRT64 with GCC, make and zlib. It expects matching FFmpeg source in `.cache/ffmpeg/source`, plus `ffmpeg-source.tar.gz` and `zlib-source.tar.gz` in `.cache/ffmpeg`. Corresponding source archives are included with the distributed installation under `resources/ffmpeg/sources`. Run the script from an MSYS2 terminal. Preserve winpthreads source and notices when distributing the result.

Review configuration and licenses before substituting another FFmpeg build. The distributed packages use shared libraries and do not include x264.

## Windows packages

Once the encoder files and Rust toolchain are ready:

```powershell
npm run dist
```

Electron-builder writes the installer and portable executable to `release`. Keep signing credentials outside the project; without credentials, the packages are unsigned. Update checks use the destination in `desktop/release-config.json`.

Tests, execution reports and local qualification tools are excluded from this source publication at the project owner's request. Candidate results are available in the release's `support.zip`. Building the app does not qualify a new public release.
