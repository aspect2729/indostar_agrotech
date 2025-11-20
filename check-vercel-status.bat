@echo off
REM Check Vercel Deployment Status

echo ========================================
echo Vercel Deployment Status Checker
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI not installed
    echo Install with: npm install -g vercel
    exit /b 1
)

echo [INFO] Checking authentication...
call vercel whoami
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not logged in to Vercel
    echo Run: vercel login
    exit /b 1
)

echo.
echo ========================================
echo Recent Deployments
echo ========================================
call vercel ls

echo.
echo ========================================
echo Deployment Logs (last 100 lines)
echo ========================================
call vercel logs --follow=false

echo.
echo ========================================
echo Environment Variables
echo ========================================
call vercel env ls

echo.
echo ========================================
echo Project Info
echo ========================================
call vercel inspect

echo.
echo To view real-time logs: vercel logs --follow
echo To check specific deployment: vercel logs [deployment-url]
echo.

pause
