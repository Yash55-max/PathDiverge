# PathDiverge Frontend - Install and Run Script
# This script sets up the environment and runs the dev server

$NodePath = "C:\Program Files\nodejs"
$env:Path = "$NodePath;$env:Path"

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "`nStarting development server..." -ForegroundColor Green
npm run dev
