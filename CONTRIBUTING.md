# Contributing to Fio Motion

Bug reports, documentation improvements and code contributions are welcome.

## Report a problem

Open an issue with the app version, Windows version, GPU and steps to reproduce. Describe what happened and what you expected. A small collected project can help, but do not upload private artwork or personal files.

## Propose a change

For larger changes, open an issue first so we can agree on the direction. Keep pull requests focused, explain the behavior change and describe how you checked it. Preserve existing project compatibility and third-party notices.

See [the build guide](docs/BUILD.md) for desktop development. For the website, run `npm run site:build` followed by `npm run site:preview`; the build uses checked-in release metadata for local previews. Public deployment validates current GitHub releases.

Test files and local qualification reports are excluded from this repository. Include reproduction steps and relevant validation results in your pull request rather than adding generated results or private fixtures.

Fio Motion's original code and documentation use the [MIT license](LICENSE). Contributions are submitted under the same terms. Third-party code and assets must retain their own license and attribution; do not submit material you do not have permission to contribute.
