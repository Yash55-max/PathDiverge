
$Git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Deploying Runtime Config..." -ForegroundColor Cyan

# 1. Add All
& $Git add .

# 2. Commit
& $Git commit -m "Fix: Force Render to use Python 3.11 via runtime.txt"

# 3. Push
& $Git push origin main

Write-Host "Runtime Config Deployed! 🚀" -ForegroundColor Green
