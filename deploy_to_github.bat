@echo off
echo ================================================================
echo SMART CAMPUS IQ - 1-CLICK GITHUB PUSH FOR RAILWAY & VERCEL
echo ================================================================
echo.

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/your-username/smart-campus-iq.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided.
    pause
    exit /b
)

echo.
echo Adding Git remote origin and pushing main branch...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ================================================================
echo SUCCESS! Your code is live on GitHub.
echo.
echo Next steps:
echo 1. Go to https://railway.app -> Deploy from GitHub -> root: /backend
echo 2. Go to https://vercel.com  -> Import repo -> root: /frontend
echo ================================================================
pause
