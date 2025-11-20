@echo off
REM Vercel Deployment Script for Windows

echo ========================================
echo Indostar E-commerce - Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI not found!
    echo.
    echo Installing Vercel CLI globally...
    call npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install Vercel CLI
        exit /b 1
    )
)

echo [INFO] Vercel CLI found
echo.

REM Check if user is logged in
echo [INFO] Checking Vercel authentication...
call vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Not logged in to Vercel
    echo.
    echo Please login to Vercel:
    call vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Login failed
        exit /b 1
    )
)

echo [INFO] Authenticated with Vercel
echo.

REM Build frontend
echo [INFO] Building frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    exit /b 1
)

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

cd ..
echo [SUCCESS] Frontend built successfully
echo.

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
echo.
echo Choose deployment type:
echo 1. Preview deployment (for testing)
echo 2. Production deployment
echo.
set /p DEPLOY_TYPE="Enter choice (1 or 2): "

if "%DEPLOY_TYPE%"=="2" (
    echo.
    echo [INFO] Deploying to PRODUCTION...
    call vercel --prod
) else (
    echo.
    echo [INFO] Deploying PREVIEW...
    call vercel
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Deployment failed
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Deployment completed!
echo ========================================
echo.
echo Next steps:
echo 1. Check the deployment URL provided above
echo 2. Test the application
echo 3. Update Google OAuth settings with the new URL
echo 4. Configure environment variables in Vercel dashboard
echo.
echo To view logs: vercel logs
echo To check status: vercel ls
echo.

pause
