@echo off
setlocal enabledelayedexpansion

set "FFMPEG=C:\Program Files\ffmpeg-9.0-essentials_build\bin\ffmpeg.exe"

for %%f in (*.webp) do (
    echo Processing: %%f
    "%FFMPEG%" -i "%%f" -vf hflip "temp_%%f"
    move /y "temp_%%f" "%%f" >nul
)

echo Done! All WebP images have been flipped.
pause