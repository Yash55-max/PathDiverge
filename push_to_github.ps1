
$Git = "C:\Program Files\Git\cmd\git.exe"

# Normalize path if needed (e.g. handle spaces)
$GitCmd = "& '$Git'"

Write-Host "Using Git from: $Git" -ForegroundColor Cyan

# Initialize Git
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git Repository..." -ForegroundColor Cyan
    & $Git init
}

# Add Files
Write-Host "Adding files to stage..." -ForegroundColor Cyan
& $Git add .

# Commit
Write-Host "Committing changes..." -ForegroundColor Cyan
& $Git commit -m "Initial commit: PathDiverge v1.2.0 (Polished UI & Interactive Charts)"

# Rename Branch
& $Git branch -M main

# Add Remote
Write-Host "Adding remote..." -ForegroundColor Cyan
& $Git remote remove origin 2>$null
& $Git remote add origin https://github.com/Yash55-max/PathDiverge

# Push
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
& $Git push -u origin main
