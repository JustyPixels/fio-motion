# Your first animation — Fio Motion

Start with the included fox, then try your own artwork. This guide takes you from separate pieces to a finished video. [Download Fio Motion](https://justypixels.github.io/fio-motion/#downloads) or [read the product overview](https://justypixels.github.io/fio-motion/index.md).

## 1. Get ready

Download the Windows 11 x64 installer or portable executable. Check the download section for current release status, signing information, release notes and checksums.

On the welcome screen choose **Learn with the example** for a prepared pin animation. The support archive also includes **Fio character.puppet**, a shared-skeleton example. Keep its matching **.assets** folder beside the project. Save a copy before experimenting.

## 2. Import artwork

1. Choose **New project**. Set dimensions and frame rate; 1920×1080 at 24 fps is a useful starting point.
2. Open **Rig** and choose **Import artwork**. Import transparent PNG pieces or a supported layered PSD.
3. Give the pieces clear names, such as Body, Head, Left arm, Right arm and Tail. Keep movable parts on separate layers.
4. Arrange artwork on the canvas. The Layers tree controls drawing order; front pieces sit above pieces behind them.

PNG, JPEG and WebP are supported. PSD import begins with 8-bit RGB documents and reports unsupported Photoshop features. See the [compatibility notes](https://github.com/JustyPixels/fio-motion/blob/main/docs/COMPATIBILITY.md).

## 3. Connect the character

For a simple character, select a piece in **Rig**, choose a destination in **Connected pieces → Follow layer**, then click **Connect piece**. Accessories can follow the body; the head can follow a layer, pin or bone. The visual **Connect** tool offers the same operation on the canvas.

For a biped, select artwork and open the **Humanoid assistant**. Associate body parts, place joints, test bending and apply. Whole and segmented limbs are supported. Already-rigged or animated pieces require **Work on a copy**.

Connections preserve placement and drawing order. Rig edits create no animation keyframes. Undo restores the previous rig.

## 4. Animate a wave

1. In **Rig**, select the arm and add a movement pin near the hand. Add an anchor near the shoulder. Drag the hand to test the bend.
2. Switch to **Animate** and check that **Auto-key** is enabled. Select the hand pin directly on the canvas.
3. At the first frame, set the starting hand pose. Press **K** to add a keyframe if one does not exist.
4. Move the playhead forward and drag the hand to its next pose; Auto-key records it. Add alternating poses for a wave.
5. Press **Space** to play. Select and drag keyframes to change movement durations.

In Animate, clicking a connected character selects the group. Double-click to work on a piece; press **Escape** to return to the character. Visible pins and bones remain directly selectable.

## 5. Adjust easing

Select a keyframe diamond and open **Curve editor** in the timeline toolbar. Choose **Smooth** for a gentle start and finish, or drag Bézier handles to shape acceleration.

Timing curves change speed; spatial path handles change the route. New movement keys use smooth easing by default. Choose Linear or Hold deliberately when appropriate.

Copy keyframes with **Ctrl+C**, move the playhead, then paste with **Ctrl+V**. Copying a pose uses separate **Ctrl+Shift+C** and **Ctrl+Shift+V** commands.

## 6. Export

Use **Assemble** to arrange shots and import WAV or MP3 audio. Click **Export**, choose a scene or production range, then select MP4 or a transparent PNG sequence. Add the job to the render queue and wait for completion.

MP4 is convenient for sharing. Transparent PNG sequences preserve alpha for compositing elsewhere. All features, including higher-resolution export, are unlocked in the current candidate.

Save the .puppet project too. Keep its managed artwork/audio folders together, or use **Collect project** for a portable archive.

## Help

The [illustrated guide](https://justypixels.github.io/fio-motion/guide/) includes real editor screenshots. Consult [release notes](https://github.com/JustyPixels/fio-motion/releases) for known limitations, and [report reproducible issues](https://github.com/JustyPixels/fio-motion/issues) with the app version and steps to reproduce.
