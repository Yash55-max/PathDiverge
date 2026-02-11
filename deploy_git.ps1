
$Git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Starting Upload to GitHub..." -ForegroundColor Cyan

# 1. Add all changes
Write-Host "Staging files..." -ForegroundColor Yellow
& $Git add .

# 2. Commit
Write-Host "Committing..." -ForegroundColor Yellow
& $Git commit -m "Docs: Added professional README and cleaned up artifacts"

# 3. Push
Write-Host "Pushing to main..." -ForegroundColor Yellow
& $Git push origin main

Write-Host "Upload Complete! 🚀" -ForegroundColor Green
