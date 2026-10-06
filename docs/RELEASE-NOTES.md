# Fio Motion 1.0.0-rc.1

A fully unlocked public test candidate for offline 2D character animation on Windows 11 x64.

This build is **unsigned**, as authorized by the publisher. Windows may display trust or SmartScreen warnings. No certificate publisher identity is claimed.

## Included

- Visual connections between artwork pieces and a humanoid assistant for whole or segmented limbs.
- Shared character skeletons with independent instance animation, smooth tweening and keyframe clipboard tools.
- Persistent workspace layouts, clearer Auto-key controls, welcome screen and seven UI languages.
- Installer, portable executable, sample projects, offline guides, compatibility notes and dependency notices.

## Verification

42 TypeScript unit tests, 3 Rust tests and 49 browser tests passed. Final packaged startup, schema migration, save/reopen, preview/export equality and eight close/crash checks passed. The portable launcher starts and finds its bundled encoder on the available Windows 10 host.

Production exports passed: 43,200 frames at 1080p (30 minutes, rendered in 691.909 seconds) and 1,440 frames at 4K (60 seconds, rendered in 72.854 seconds). Audio cue error was at most 10 ms. The 60-shot / 100,000-key fixture has 50 visible layers and three 2,025-vertex weighted limbs; each 30-second shot includes one second of bends followed by a held pose. These timings do not measure continuous movement throughout a 30-minute render.

The complete editor reached about 18 fps at 1080p with continuous movement on a Xeon E5-2667 v4 / 16 GB / GTX 1060 host using Chrome in development mode. The requested 30-fps reference-machine target is not certified.

## Remaining qualification

Clean Windows 11 installation/upgrade/uninstall and native DPI testing, reference hardware, independent artist/usability tests, seven-language review and brand review remain pending. Some diagnostics fall back to English. Shared skeleton structural edits are managed by the assistant.

Use the support archive for the latest publication-time reports; embedded reports are snapshots from packaging. Verify downloads using SHA256SUMS. Report reproducible problems in the distribution repository. This candidate is **not qualified stable 1.0.0**.
