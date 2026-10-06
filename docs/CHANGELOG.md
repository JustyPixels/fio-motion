# Changes



## 1.0.0-rc.1 — 2026-10-05



- Rebrand to Fio Motion, welcome screen, optional example and separate preferences.

- Neutral studio layout, resizable/collapsible panels and workspace-specific persistence.

- Separate character hierarchy, visual connections, direct rename and character selection/gizmos.

- Humanoid assistant with whole/segmented parts, joint placement, movement preview and atomic Undo.

- Shared schema-3 skeletons, independent animation, safe beta migration and detached-piece pose preservation.

- Timeline clipboard, box selection, snapping, fit/navigation tools and explicit Auto-key.

- Seven locale catalogs and offline guidance; optional daily stable-release checks for JustyPixels/fio-motion-releases.

- Close Save/Discard/Cancel and a real process-crash recovery campaign.

- RC packaging and fail-closed public qualification checks. Unsigned public candidate publication is authorized by the owner; stable 1.0 qualification remains pending.





## 0.1.0-beta.3 - 2026-10-05



- Connect separate artwork pieces to layers, pins or bone tips, with placement preserved.

- Shift-select several pieces to connect them at once. Build complete character chains.

- Animate a parent to move its connected pieces; pins follow deformation and bones follow IK.

- Disconnect and remove controls without losing piece placement; connections support Undo/Redo.

- Duplicate and reuse entire connected characters with independent animation and shared source rigs.

- The fox sample opens with all six pieces connected to its body.

- Project schema 2 stores connections and migrates schema-1 files safely.

- 28 TypeScript unit tests and all 21 editor browser tests passed. Native connected-character saving/reopening and preview/export pixel equality also passed.



## 0.1.0-beta.2 - 2026-10-05



- Preview follows the project aspect ratio at every window size, including 4:3, 16:9, square and portrait projects.

- Fit uses the available preview area. Unused space remains around the artwork instead of stretching it.

- Canvas, pins, bones and onion skins share the same bounds; zoom preserves those proportions.

- All 16 editor browser tests passed, including four aspect-ratio resize tests.

