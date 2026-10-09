Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "SMART CAMPUS IQ - 1-CLICK GITHUB PUSH FOR RAILWAY & VERCEL" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub Repository URL (e.g. https://github.com/your-username/smart-campus-iq.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Error: No repository URL provided." -ForegroundColor Red
    exit
}

Write-Host "`nAdding Git remote origin and pushing main branch..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl
git branch -M main
git push -u origin main

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "SUCCESS! Your code is pushed to GitHub." -ForegroundColor Green
Write-Host "Deploy Backend on Railway: https://railway.app (Root directory: /backend)" -ForegroundColor Yellow
Write-Host "Deploy Frontend on Vercel: https://vercel.com  (Root directory: /frontend)" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Green
