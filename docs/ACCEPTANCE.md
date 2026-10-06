# Fio Motion 1.0.0-rc.1 — verification status

This report distinguishes executable checks from release qualification. Measured checks are listed below. Remaining qualification gates are explicitly identified.

| Area | Evidence | Status |
|---|---|---|
| Animation | Smooth, hold, overshoot, spatial curves, exact keys, full rotations, clips, audio gain, deterministic evaluation | Unit checks passed |
| Rigging | Bone weights, joint limits and two-bone IK; Rust holes/islands, translation and contradictory constraints | Unit checks passed |
| Editor | PSD hierarchy/masks/offsets, unsupported-depth rejection, rig undo, bones, seeking, transparent export, folder-opacity pixels | 28 TypeScript unit tests, 3 Rust tests and 21 browser tests passed, including sampled audio gain, actual artwork onion skins and independent blur/shadow |
| Preview aspect ratio | 16:9, 4:3, 1:1 and 9:16 across four window sizes and zoom; canvas and pin overlay stay aligned | Four resize regression tests passed |
| Connected character rigs | Layer, pin and bone connections, bulk binding, placement preservation, undo/redo, deletion, copies, legacy migration and deterministic seeking | Nine unit tests and five browser workflows passed; native save/reopen and identical preview/export pixels passed; `reports/connected-character-desktop.json` |
| Desktop persistence | Save As and reopen the six-layer sample | Passed |
| MP4 and audio | 12 frames at 960 Ã— 540 with AAC | Passed; `reports/export-smoke.json` |
| Animated rendering | 50 layers, three 2025-vertex puppets at 1080p: median 26.2 ms, p95 33.3 ms, about 38 fps | Engine + GPU measurement; excludes editor UI and audio; `reports/preview-benchmark.json` |
| Solver speed | Three 2025-vertex / 3872-triangle rigs: median 14.102 ms, p95 14.162 ms | CPU-only measurement; `reports/deformation-benchmark.json` |
| Production scale | 60 shots, 100,000 keys, 50 visible layers and 3 rigs per active shot | Opened in 2.2-6.3 s; 30-minute export passed |
| 30-minute 1080p and 60-second 4K | Full frame counts, dimensions, audio duration and cue timing within one frame | 30-minute 1080p passed: 43,200 frames in 394.823 s, audio duration 1800 s; 4K passed: 1,440 frames in 52.176 s, audio duration 60 s; `reports/production-exports.json`; cue error at most 10 ms, `reports/audio-synchronization.json` |
| Encoding quality | Decoded pixel checks for both long renders; NV12 input verified at 540p, 1080p and 4K (PSNR above 38 dB) | Passed; `reports/codec-quality.json` and `reports/production-exports.json` |
| Reference performance | i5-12400, 16 GB, GTX 1650, full 1080p animated preview | Required hardware unavailable; not certified |
| Beginner guidance | Built-in five-step guide and sample | Implemented; independent usability test pending |
| Recovery/failure scenarios | Atomic writes and periodic journal/checkpoints implemented | Interrupted manifest write, retained old assets, successful subsequent save, recovery checkpoint, missing assets, unaccepted-open destination preservation, new-project destinations and export cancellation passed; `reports/reliability.json`. Restored unsaved work and both close-dialog choices also passed; `reports/close-recovery.json`. Save/Discard/Cancel, cancelled and failed saves, actual main-process kill, checkpoint restoration and successful close-save passed; `reports/close-campaign.json` |
| Packaging | Windows x64 installer and portable build | Installer and portable packages built; Packaged startup, bundled encoder, sample save and MP4/audio export passed; `reports/packaged-smoke.json`; unsigned |

The available host runs Windows 10 (build 19045); clean Windows 11 installer qualification remains pending.

The CPU measurement ran on an Intel Xeon E5-2667 v4 at 3.20 GHz with 16 GB RAM. Its approximate 71 CPU-only frames/s excludes WebGL, editor layout, asset loading and audio. It does not establish the requested 30-fps end-to-end target.

The production export fixture uses static poses across a full-size production. It exercises the complete frame stream and encoder with cached static frames; it is not an animated-preview throughput measurement. The separate animated engine/GPU benchmark is recorded above; end-to-end reference-machine certification is still required.

Remaining product gaps are documented in `COMPATIBILITY.md`. This build is suitable for hands-on evaluation, not a claim that all professional public-beta release gates have been met.


## RC additions (2026-10-05)

42 TypeScript unit checks passed, including shared skeletons, rigid segmented parts, IK-enabled distal controls, copy protection, atomic Undo, detached shape preservation, rational/subframe clipboard timing and serialized preferences. Three Rust checks passed. The full 49-test browser suite passed, including seven locales at three browser pixel ratios and seven RC workflows. Browser pixel ratios do not certify actual Windows display scaling.

The new native shared-character workflow passed: four connected pieces, animated common bone, schema-3 save/reopen and zero maximum channel difference between preview and exported PNG. The native close/crash campaign passed all eight checks. These results do not replace Windows 11, reference hardware, native-speaker or independent artist/usability qualification.

The previous static production and preview measurements above are beta measurements, not recertification of this candidate. New animated shared-rig production results are recorded separately when completed. See `reports/release-qualification.json` for the public gates.


## Complete-editor measurement

The RC editor with audio-clock playback, 60 shots, 100,000 keys, 50 visible layers and three continuously animated 2,025-vertex weighted limbs completed 209 displayed GPU frames in 11.49 seconds: 18.11 fps, median frame interval 48.3 ms, p95 85.4 ms. Hardware: Xeon E5-2667 v4, 16 GB RAM, GTX 1060 3 GB; Windows 10, Chrome development host. No concurrent native export ran during this measurement. This does not meet or certify the requested 30-fps reference-machine target. See `reports/editor-benchmark.json`.

Unsigned publication is authorized by the owner. Invalid signatures still block distribution, while the recorded NotSigned status is disclosed in the public download notes.


## Packaged RC production exports

The new 60-shot / 100,000-key production passed in the packaged candidate: 43,200 frames at 1920 × 1080 in 691.909 seconds, and 1,440 frames at 3840 × 2160 in 72.854 seconds. Audio durations are 1800 and 60 seconds; sampled cue alignment differs by at most 10 ms (within one 24-fps frame). Encoded frames contain movement and match the full-resolution preview (1080p PSNR 41.55 dB).

The active shot has 50 visible layers and three shared weighted limbs of 2,025 vertices each. Each 30-second shot uses a one-second bend followed by a held pose; identical evaluated poses use a bounded frame cache, while every output frame is encoded. These timings are not measurements of continuously animated deformation throughout a 30-minute render. Reports: `animated-production-exports.json` and `animated-audio-synchronization.json`.

Final native candidate checks passed again after the capture/cache changes: startup and audio/video, schema 1/2, connected/shared save/reopen and PNG equality, and eight close/crash checks. The support archive contains the latest publication-time reports; embedded reports are snapshots from packaging.

The portable launcher was also exercised directly: it unpacked, opened the six-layer sample and found the included encoder. This Windows 10 check does not certify clean Windows 11 installation or uninstall. See `reports/portable-smoke.json`.
