@echo off
setlocal enabledelayedexpansion

set "PYTHON_EXE=C:\Python\python.exe"

if not exist "%PYTHON_EXE%" (
    echo [ERROR] Python not found at C:\Python\python.exe!
    goto :end
)

"%PYTHON_EXE%" -c "import PIL" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Pillow module missing. Installing Pillow automatically...
    C:\Python\Scripts\pip.exe install Pillow
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install Pillow automatically.
        echo Please open cmd and run: C:\Python\Scripts\pip.exe install Pillow
        goto :end
    )
)

echo [INFO] Scanning folder for WebP images...
echo ----------------------------------------------------------------

for %%F in (*.webp) do (
    echo Processing: %%F
    "%PYTHON_EXE%" -c "from PIL import Image; img = Image.open(r'%%F').convert('RGBA'); bbox = img.getbbox(); img.crop(bbox).save(r'%%F', 'WEBP')"
)

echo ----------------------------------------------------------------
echo [SUCCESS] All WebP images trimmed!

:end
echo.
pause
