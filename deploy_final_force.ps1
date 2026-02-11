
$Git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Force Deploying Final Config..." -ForegroundColor Cyan

# 1. Add All
& $Git add .

# 2. Commit (Amend to combine last change if needed, or allow empty)
& $Git commit -m "Config: Final update to Railway API" --allow-empty

# 3. Force Push
& $Git push origin main --force

Write-Host "Forced Config Deployed! 🚀" -ForegroundColor Green
