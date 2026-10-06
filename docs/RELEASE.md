# Fio Motion 1.0 release qualification

The current candidate is 1.0.0-rc.2, a branding and packaging update. The owner explicitly authorized unsigned publication on 2026-10-05. Publish it as an unsigned public prerelease for testing; qualification for stable 1.0 still requires the remaining gates below. RC 1 measurements remain historical evidence; do not present them as newly measured RC 2 results.

Distribution destination: `JustyPixels/fio-motion`. The repository contains application source, guides and issue reports; packaged downloads are published through Releases. The owner supplied the GitHub name. Unsigned downloads can produce Windows trust or SmartScreen warnings; no certificate publisher identity is claimed.

## Required external inputs

- GitHub authentication for JustyPixels and creation/access to the distribution repository.
- Windows 11 clean-machine testing and the i5-12400 / 16 GB / GTX 1650 reference machine.
- At least three beginners and two animators, real character artwork, and review of critical copy in all seven languages.
- Review of potential naming conflicts for Fio Motion before public branding is finalized.

## Candidate checks

Run TypeScript/unit, editor browser and Rust checks. Confirm beta schemas migrate to 3, original files stay intact until an explicit save, shared rigs have independent instance animation, and arbitrary seeking matches exported frames. Exercise whole/segmented limbs, IK, finite geometry, fixed/movement pin precedence and extreme bends. Verify clipboard, snapping, collisions, all aspect ratios and DPI settings.

Native checks must include close Save/Discard/Cancel, cancelled saves, interrupted writes, process termination and recovery, missing assets and export cancellation. Run animated 30-minute / 60-shot / 100,000-key production and 60-second 4K exports; publish actual frame counts, timing and hardware.

## Public promotion

`npm run release:verify -- --prerelease` checks candidate version, both packages, automated evidence and signature status. Unsigned candidates are allowed only because the owner's authorization is recorded. Invalid signatures still fail verification. `npm run release:verify -- --public` additionally requires the remaining qualification gates and a stable version.

Prepare installer, portable executable, SHA256SUMS, sample project, offline guides, compatibility notes and third-party notices. Record signatures before generating hashes. Publish tested RC assets as a GitHub prerelease, clearly labeled unsigned and with known limitations. Promote to stable only after remaining gates are verified with evidence. Keep prior beta downloads available; use stable 1.0.0 tags for update notifications. GitHub prereleases are excluded from the stable update channel.

Updates are opt-in, once per day at most; the main process requests a bounded GitHub response with a ten-second timeout. Checking manually also works. Downloads open in the user's browser. There is no automatic installation or telemetry.
