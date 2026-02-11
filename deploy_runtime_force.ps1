
$Git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Force Pushing Runtime Config..." -ForegroundColor Cyan

# 1. Add All (Just in case)
& $Git add .

# 2. Commit (Amend to combine last change if needed, or just commit)
& $Git commit -m "Fix: Force Render python version" --allow-empty

# 3. Force Push
& $Git push origin main --force

Write-Host "Deployment Forced! 🚀" -ForegroundColor Green
