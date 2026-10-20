@echo off
setlocal EnableExtensions EnableDelayedExpansion

title Killfeed Generator - PHP dev server

set "REQUIRED_MAJOR=8"
set "REQUIRED_MINOR=4"
set "REQUIRED_VERSION=%REQUIRED_MAJOR%.%REQUIRED_MINOR%"
set "HOST=127.0.0.1"
set "PORT=8000"

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "DEPS_DIR=%ROOT%\dependencies"
set "PHP_DIR=%DEPS_DIR%\php"
set "PHP_EXE=%PHP_DIR%\php.exe"
set "PHP_ZIP=%DEPS_DIR%\php-%REQUIRED_VERSION%.zip"
set "PHP_URL=https://windows.php.net/downloads/releases/latest/php-8.4-nts-Win32-vs17-x64-latest.zip"

set "PHP_CMD="

echo.
echo   Killfeed Generator
echo   ------------------
echo   Looking for PHP %REQUIRED_VERSION% ...
echo.

call :check_php "%PHP_EXE%"

if not defined PHP_CMD (
  for %%P in (php.exe) do (
    if not "%%~$PATH:P"=="" call :check_php "%%~$PATH:P"
  )
)

if not defined PHP_CMD (
  call :download_php
  if errorlevel 1 goto :fail
  call :check_php "%PHP_EXE%"
)

if not defined PHP_CMD (
  echo [ERROR] PHP %REQUIRED_VERSION% is still not available.
  goto :fail
)

echo   Using PHP : !PHP_CMD!
"!PHP_CMD!" -v | findstr /i "PHP"
echo.
echo   Server root : %ROOT%
echo   Address     : http://%HOST%:%PORT%/
echo   Stop        : press Ctrl+C
echo.

start "" "http://%HOST%:%PORT%/"
"!PHP_CMD!" -S %HOST%:%PORT% -t "%ROOT%"

echo.
echo   Server stopped.
pause
exit /b 0

:check_php
if defined PHP_CMD exit /b 0
if not exist "%~1" exit /b 1
set "PHP_PROBE="
set "PHP_PROBE_FILE=%TEMP%\killfeed-php-version.tmp"
"%~1" -n -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" > "%PHP_PROBE_FILE%" 2>nul
if exist "%PHP_PROBE_FILE%" for /f "usebackq delims=" %%V in ("%PHP_PROBE_FILE%") do set "PHP_PROBE=%%V"
del /f /q "%PHP_PROBE_FILE%" >nul 2>nul
if /i "!PHP_PROBE!"=="%REQUIRED_VERSION%" set "PHP_CMD=%~1"
exit /b 0

:download_php
echo   PHP %REQUIRED_VERSION% not found - installing a portable copy.
echo   This only happens once, the files go to "%PHP_DIR%".
echo   Downloading from windows.php.net ...
echo.

if not exist "%DEPS_DIR%" mkdir "%DEPS_DIR%" >nul 2>nul

where powershell >nul 2>nul
if errorlevel 1 (
  echo [ERROR] PowerShell was not found, so PHP cannot be downloaded automatically.
  echo         Install PHP %REQUIRED_VERSION% manually and add it to the PATH,
  echo         or place a portable build in "%PHP_DIR%".
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri '%PHP_URL%' -OutFile '%PHP_ZIP%' -UseBasicParsing } catch { Write-Host $_.Exception.Message; exit 1 }"
if errorlevel 1 (
  echo.
  echo [ERROR] Download failed. Check your internet connection and try again.
  exit /b 1
)

echo   Extracting ...
if exist "%PHP_DIR%" rmdir /s /q "%PHP_DIR%"
mkdir "%PHP_DIR%" >nul 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Expand-Archive -LiteralPath '%PHP_ZIP%' -DestinationPath '%PHP_DIR%' -Force } catch { Write-Host $_.Exception.Message; exit 1 }"
if errorlevel 1 (
  echo.
  echo [ERROR] Could not extract the PHP archive.
  exit /b 1
)

del /f /q "%PHP_ZIP%" >nul 2>nul

if not exist "%PHP_DIR%\php.ini" if exist "%PHP_DIR%\php.ini-development" copy /y "%PHP_DIR%\php.ini-development" "%PHP_DIR%\php.ini" >nul

echo.
echo   PHP %REQUIRED_VERSION% installed in "%PHP_DIR%".
echo.
exit /b 0

:fail
echo.
echo   Setup failed. Press any key to close this window.
pause >nul
exit /b 1
