@echo off
setlocal enabledelayedexpansion

echo Checking system dependencies...
echo.

:: Check if Chocolatey is installed
where choco >nul 2>nul
if %errorlevel% neq 0 (
    echo Chocolatey is not installed. Please install it first:
    echo.
    echo     @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    echo.
    pause
    exit /b 1
)

:: Function to check and install dependency
set "MISSING_DEPS="
call :check_dependency "ffmpeg" "FFmpeg"
call :check_dependency "magick" "ImageMagick"
call :check_dependency "soffice" "LibreOffice"
call :check_dependency "ebook-convert" "Calibre"
call :check_dependency "gs" "Ghostscript"
call :check_dependency "pdfimages" "Poppler"

:: If any dependencies are missing, install them
if not "!MISSING_DEPS!"=="" (
    echo.
    echo The following dependencies need to be installed:
    echo !MISSING_DEPS!
    echo.
    choice /C YN /M "Would you like to install them now"
    if !errorlevel!==1 (
        echo.
        echo Installing dependencies...
        echo.
        if not "!MISSING_DEPS:FFmpeg=!"=="!MISSING_DEPS!" choco install ffmpeg -y
        if not "!MISSING_DEPS:ImageMagick=!"=="!MISSING_DEPS!" choco install imagemagick -y
        if not "!MISSING_DEPS:LibreOffice=!"=="!MISSING_DEPS!" choco install libreoffice-fresh -y
        if not "!MISSING_DEPS:Calibre=!"=="!MISSING_DEPS!" choco install calibre -y
        if not "!MISSING_DEPS:Ghostscript=!"=="!MISSING_DEPS!" choco install ghostscript -y
        if not "!MISSING_DEPS:Poppler=!"=="!MISSING_DEPS!" choco install poppler -y
    )
) else (
    echo.
    echo All dependencies are installed!
)

echo.
pause
exit /b 0

:check_dependency
where %1 >nul 2>nul
if %errorlevel% neq 0 (
    set "MISSING_DEPS=!MISSING_DEPS! %2"
)