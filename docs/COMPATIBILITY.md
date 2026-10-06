# Compatibility and practical limits

## Artwork

PNG, JPEG, WebP and 8-bit RGB PSD are supported. Convert PSD artwork to sRGB before importing; embedded profiles are not converted. Maximum individual artwork dimension is 8192 pixels. PSD import is capped at 600 layers and 512 MB decoded raster data.

PSD decoding uses ag-psd. Supported raster layers retain names, duplicate-name identities, folder relationships, offsets, visibility, opacity, clipping, and normal, multiply, screen, overlay, darken and lighten blends. Folder compositing applies opacity to the combined content. Pass-through folders are passed through when fully opaque. Raster layer masks retain their position and outside color.

Text and smart objects use their stored raster appearance. Adjustments, editable effects, smart filters, vector masks, unsupported blends, absent raster data, and folder masks require preparation in Photoshop. The import report names affected layers; the document is never silently flattened. Apply folder masks to the child raster layers before import. Rasterize effects and vector masks, save raster previews, and choose supported blending. Pixel-perfect equivalence with every Photoshop PSD is not claimed.

Artwork replacement accepts dimension-compatible PNG, JPEG and WebP per layer. PSD replacement maps raster layers by folder path, name and duplicate-layer order, validates every dimension before applying changes, and preserves rigs and animation. Keep layer names, folders, duplicate order and raster bounds compatible. Manual swaps require matching dimensions.

## Projects and rendering

The current project schema is version 3. Schema-1 and schema-2 projects migrate on opening without converting legacy connections or changing animation; explicit saving writes schema 3. Earlier beta applications reject schema 3. Unsupported future versions are rejected without rewriting their files. Project references use stable IDs, and managed asset paths may not escape the manifest directory. Missing artwork is reported rather than replaced silently.

The app supports at most 600 shots, 2000 assets, and 1000 rigs and one million total keyframes. Save/collect limits managed assets to 1 GB. Files and decoded audio are held in memory; GPU textures load as used and have a 256 MB cache budget. Timeline rows are virtualized, but inactive shot manifests are currently loaded with the project. Full on-demand shot storage remains a scale improvement.

Exports support dimensions through 3840 × 2160, frame rates through 120, and up to 1,000,000 frames. Production audio exports support 200 clips and a one-hour range. Native MP4 uses Windows Media Foundation H.264 plus AAC through a separate FFmpeg process. A functioning Windows H.264 encoder is required; PNG sequences remain available when video encoding fails. MP4 is opaque. PNG sequences preserve alpha when enabled.

Motion blur uses four temporal samples during export. The editor preview displays the central sample. Masks are raster or feathered rectangles, not a vector mask drawing system. Basic effects operate in the GPU pipeline; linear-light color management and advanced color grading are not implemented.

Rig controls are evaluated at explicit times, with cached solver preparation. Extreme deformation can still cause folds or texture distortion; anchors, stiffness and carefully placed controls help. Geometry tests check finite results and holes; a complete artist-reviewed bend/overlap fixture catalog remains a release gate.

## Release status

Windows 11 x64 is the target. Development tests ran on the available Windows host, not on every supported GPU. Packages are unsigned. The requested i5-12400 / GTX 1650 30-fps certification, independent beginner test, and clean-machine installer test remain unverified. The 1.0 candidate is fully unlocked. Licensing entitlements do not change project formats.

## Shared characters

The humanoid assistant suggests names without recognizing image content. Whole limbs use automatic skin weights; segmented pieces follow their assigned bone. Hands and feet follow the forearm/shin controls. Place joints carefully, review assignments and test movement before applying. Existing rigged or animated pieces require a copy; cancelling never edits the project.

Instances share their source skeleton and have independent root/control tracks. Piece rigs still support explicit pins, with fixed constraints taking precedence. Disconnecting a weighted piece preserves its solved shape as a frozen local pose, with original artwork UVs. Rebuilding that detached mesh is an explicit rig edit and clears the frozen shape. Shared skeleton structure is managed by the assistant; arbitrary structural edits to its generated bones are not exposed in this candidate. Local bone parenting remains available.

Critical catalog translations and offline guides are included in seven languages. Independent native-speaker review remains required, and unrecognized diagnostic text falls back to English. Browser pixel-ratio testing does not substitute for clean Windows DPI qualification.
