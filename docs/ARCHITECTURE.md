# Editor architecture

The Electron main process owns validated filesystem operations, native file dialogs, recovery, and FFmpeg child processes. A sandboxed, context-isolated preload exposes a narrow typed bridge. Renderer Node integration is disabled, external navigation is blocked, and a content security policy restricts loading.

React manages the three workspaces. `model.ts` defines versioned project, asset, layer, rig, animation, clip, shot, sequence, and export job data. `history.ts` stores undoable commands using structural sharing. `animation.ts` performs timestamp evaluation, timing and spatial interpolation, clip blending and shot resolution.

Evaluation follows:

```
timestamp -> animation tracks and clips -> bone and pin controls
          -> shared character skeleton and skin targets -> local bone/pin corrections
          -> worker deformation -> connected-layer control frames -> WebGL compositing -> effects -> frame
```

The same Engine and Renderer are used for the stage and export. Export jobs snapshot the project at enqueue time and await each encoded frame. Constant scenes can cache a rendered frame while still encoding every required frame. Seeking does not advance hidden physics state.

The worker imports PSDs through ag-psd and calls Rust WebAssembly for triangulation and ARAP solving. Spade provides constrained triangulation; transparent-mask tests remove geometry outside the artwork and preserve holes and disconnected regions. Bone influences are evaluated before explicit pin constraints. The solver uses sparse Cholesky with cached preparation and an iterative fallback. Mesh and rig revision changes invalidate preparation.

WebGL2 renders deformed textured triangles, depth-based overlap, raster/rectangular masks, six blend modes, isolated folder composites, blur, tint and shadows. Textures have a bounded LRU cache. Preview resolution scales framebuffer output, not rig topology.

The audio context supplies the playback clock. Playback may skip canvas updates while audio continues. Export sends validated audio clip descriptions to FFmpeg, which trims, fades, automates volume, delays and mixes the clips without allocating a full production-length PCM buffer in the renderer.

Desktop saves write managed assets and replace the manifest atomically. Recovery writes checkpoints and a journal. Portable archives include a manifest and all managed assets. Browser development uses embedded assets and IndexedDB recovery; long streamed exports require the desktop bridge.

The beta has no public service API, login, or checkout. Feature entitlements are centralized in `model.ts`; formats remain readable independently of future tiers.

Connected pieces reference a layer, pin or bone by stable identifier. An affine bind matrix preserves artwork placement without merging textures or changing draw order. Deformed triangle frames drive pin attachments; evaluated bone tips drive bone attachments. Dependency evaluation includes hidden control layers and resolves attachment chains before compositing. Cycle and missing-control validation is part of project loading. Removal and disconnection preserve placement, and character copies remap their internal connections.

Shared character definitions and scene instances use schema 3. Definition weights are keyed by semantic part slots; instances map slots to stable scene-layer IDs and rest matrices. Rig and drawing hierarchies remain independent. Migration adds empty definition/instance lists to previous schemas and preserves the existing attachment evaluator.

Typed catalogs are generated into renderer and desktop JSON from seven-column translation sources. Only presentation uses the selected locale. Native test locale and sample shortcuts require the isolated test flag; production does not expose the development evaluation hook.

The application retains `studio.puppet.editor`, `.puppet` and the previous `Puppet Studio` user-data directory. Preferences and recents are external to project manifests. Preference writes are serialized and atomically renamed. Update checks use a fixed validated owner/repository, bounded response, timeout and stable releases only. The editor has no public network API.
