
$Git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Deploying Final Config..." -ForegroundColor Cyan

# 1. Add All
& $Git add .

# 2. Commit
& $Git commit -m "Config: Update frontend API URL to Railway production"

# 3. Push
& $Git push origin main

Write-Host "Final Config Deployed! 🚀" -ForegroundColor Green
