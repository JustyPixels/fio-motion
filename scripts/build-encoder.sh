#!/usr/bin/env bash
set -euo pipefail
export PATH="/ucrt64/bin:/usr/bin:$PATH"
TASK_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$TASK_ROOT/.cache/msys-make/unpacked/usr/bin:/ucrt64/bin:/usr/bin:$PATH"
cd "$TASK_ROOT/.cache/ffmpeg/source"
./configure \
  --prefix="$TASK_ROOT/vendor/ffmpeg-minimal" \
  --target-os=mingw32 --arch=x86_64 \
  --disable-autodetect --disable-everything --disable-debug --disable-doc \
  --disable-x86asm --enable-shared --disable-static --enable-zlib \
  --enable-mediafoundation --enable-d3d11va --enable-ffmpeg --enable-ffprobe --disable-ffplay \
  --enable-protocol=file,pipe \
  --enable-demuxer=image2pipe,wav,mp3,mov \
  --enable-muxer=mp4,null,wav,image2 \
  --enable-decoder=png,pcm_s16le,pcm_s24le,pcm_s32le,pcm_f32le,mp3,aac \
  --enable-encoder=h264_mf,aac,png,pcm_s16le \
  --enable-parser=png,mpegaudio,aac \
  --enable-filter=anull,null,aformat,format,aresample,scale,atrim,asetpts,volume,adelay,amix,apad,alimiter \
  --enable-bsf=aac_adtstoasc \
  --extra-ldflags=-static-libgcc --extra-version=puppet-studio
make -j4
make install
cp /ucrt64/bin/libwinpthread-1.dll "$TASK_ROOT/vendor/ffmpeg-minimal/bin/"
cp /ucrt64/share/licenses/winpthreads/COPYING "$TASK_ROOT/vendor/ffmpeg-minimal/winpthreads-COPYING.txt"
cp /ucrt64/bin/zlib1.dll "$TASK_ROOT/vendor/ffmpeg-minimal/bin/"
mkdir -p "$TASK_ROOT/vendor/ffmpeg-minimal/sources"
cp "$TASK_ROOT/.cache/ffmpeg/ffmpeg-source.tar.gz" "$TASK_ROOT/vendor/ffmpeg-minimal/sources/"
cp "$TASK_ROOT/.cache/ffmpeg/zlib-source.tar.gz" "$TASK_ROOT/vendor/ffmpeg-minimal/sources/"
cp "$TASK_ROOT/scripts/build-encoder.sh" "$TASK_ROOT/vendor/ffmpeg-minimal/sources/"
cp COPYING.LGPLv2.1 "$TASK_ROOT/vendor/ffmpeg-minimal/"
echo "Minimal encoder and corresponding source archives installed."
