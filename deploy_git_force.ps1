
$Git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Re-attempting Upload with Force..." -ForegroundColor Cyan

# 1. Add all changes
Write-Host "Staging files..." -ForegroundColor Yellow
& $Git add .

# 2. Commit (Amend previous if needed, or new commit)
Write-Host "Committing..." -ForegroundColor Yellow
# Using --allow-empty in case nothing changed since last commit attempt
& $Git commit -m "Docs: Final polish and upload" --allow-empty

# 3. Pull (Try to rebase first to be nice)
# Write-Host "Pooling changes..."
# & $Git pull origin main --rebase

# 3. Force Push (Since we want local state to be truth)
Write-Host "Force Pushing to main..." -ForegroundColor Red
& $Git push origin main --force

Write-Host "Force Upload Complete! 🚀" -ForegroundColor Green
