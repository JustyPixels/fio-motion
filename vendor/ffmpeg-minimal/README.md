# Bundled encoder

FFmpeg 8.1.3, source commit `330caae0c1`, built as shared LGPL-2.1-or-later libraries. GPL, version3-only and nonfree components are disabled. The enabled encoders are Windows Media Foundation H.264, native AAC, PNG and PCM. This program runs as a separate process.

`bin` contains the executables and shared libraries, plus zlib 1.3.2 and winpthreads 14.0.0.r190.g96fb1bff7-1 from MSYS2 UCRT64. All other imports are Windows system libraries. The distribution was tested with development paths removed from PATH.

`sources` includes matching FFmpeg, zlib and mingw-w64 archives and the build script. LGPL and dependency notices are included here. FFmpeg sources are unmodified. The configuration printed by `bin/ffmpeg.exe -version` is authoritative; the build script records selected features and compiler flags. Built with GCC 16.1.0 on Windows using MSYS2 tools.

Users may replace these executables and shared libraries with compatible versions. The app does not impose restrictions on modifying or reverse engineering these libraries. No x264, GPL codec, or nonfree codec is bundled. This configuration and notice collection is a technical distribution audit; it is not an independent legal review.
