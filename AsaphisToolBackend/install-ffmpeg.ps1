# Install FFmpeg on Windows
Write-Host "Installing FFmpeg..." -ForegroundColor Green

# Check if Chocolatey is installed
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Using Chocolatey to install FFmpeg..." -ForegroundColor Cyan
    choco install ffmpeg -y
} else {
    Write-Host "Chocolatey not found. Please install FFmpeg manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Download from: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor White
    Write-Host "   - Get 'ffmpeg-release-essentials.zip'" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Extract to: C:\ffmpeg" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Add to PATH:" -ForegroundColor White
    Write-Host "   - Search 'Environment Variables' in Windows" -ForegroundColor White
    Write-Host "   - Edit 'Path' variable" -ForegroundColor White
    Write-Host "   - Add: C:\ffmpeg\bin" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Restart terminal and test: ffmpeg -version" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install Chocolatey first: https://chocolatey.org/install" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "After installation, restart your terminal and run: ffmpeg -version" -ForegroundColor Green
