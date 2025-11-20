@echo off
REM Google OAuth Setup Script for Indostar E-commerce (Windows)

echo ==========================================
echo Google OAuth Setup for Indostar
echo ==========================================
echo.

REM Check if .env files exist
if not exist "backend\.env" (
    echo ERROR: backend\.env not found!
    exit /b 1
)

if not exist "frontend\.env" (
    echo ERROR: frontend\.env not found!
    exit /b 1
)

echo [OK] Found .env files
echo.

echo Current Configuration:
echo ----------------------

REM Read current credentials
for /f "tokens=2 delims==" %%a in ('findstr "GOOGLE_CLIENT_ID" backend\.env') do set BACKEND_CLIENT_ID=%%a
for /f "tokens=2 delims==" %%a in ('findstr "REACT_APP_GOOGLE_CLIENT_ID" frontend\.env') do set FRONTEND_CLIENT_ID=%%a

echo Backend Client ID: %BACKEND_CLIENT_ID%
echo Frontend Client ID: %FRONTEND_CLIENT_ID%
echo.

REM Check if using placeholder values
echo %BACKEND_CLIENT_ID% | findstr /C:"your-google-client-id" >nul
if %errorlevel%==0 (
    goto :placeholder
)

echo %BACKEND_CLIENT_ID% | findstr /C:"355932236944" >nul
if %errorlevel%==0 (
    goto :placeholder
)

echo [OK] Using custom credentials
echo.
echo To test your OAuth setup:
echo 1. Make sure backend is running: cd backend ^&^& uvicorn main:app --reload
echo 2. Make sure frontend is running: cd frontend ^&^& npm start
echo 3. Run: cd backend ^&^& python test_oauth_config.py
goto :end

:placeholder
echo.
echo WARNING: You're using placeholder/example credentials!
echo.
echo To fix Google OAuth login, you need to:
echo 1. Create real Google OAuth credentials
echo 2. Update backend\.env with your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
echo 3. Update frontend\.env with your REACT_APP_GOOGLE_CLIENT_ID
echo.
echo See FIX_GOOGLE_OAUTH.md for detailed instructions
echo.

set /p UPDATE="Do you want to update credentials now? (y/n): "
if /i not "%UPDATE%"=="y" goto :end

echo.
echo Please enter your Google OAuth credentials:
echo.

set /p NEW_CLIENT_ID="Google Client ID: "
set /p NEW_CLIENT_SECRET="Google Client Secret: "

if "%NEW_CLIENT_ID%"=="" (
    echo ERROR: Client ID cannot be empty
    exit /b 1
)

if "%NEW_CLIENT_SECRET%"=="" (
    echo ERROR: Client Secret cannot be empty
    exit /b 1
)

REM Create backup
copy backend\.env backend\.env.bak >nul
copy frontend\.env frontend\.env.bak >nul

REM Update backend\.env
powershell -Command "(Get-Content backend\.env) -replace 'GOOGLE_CLIENT_ID=.*', 'GOOGLE_CLIENT_ID=%NEW_CLIENT_ID%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'GOOGLE_CLIENT_SECRET=.*', 'GOOGLE_CLIENT_SECRET=%NEW_CLIENT_SECRET%' | Set-Content backend\.env"

REM Update frontend\.env
powershell -Command "(Get-Content frontend\.env) -replace 'REACT_APP_GOOGLE_CLIENT_ID=.*', 'REACT_APP_GOOGLE_CLIENT_ID=%NEW_CLIENT_ID%' | Set-Content frontend\.env"

echo.
echo [OK] Credentials updated successfully!
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Restart your frontend server
echo 3. Try logging in at http://localhost:3000/login

:end
echo.
echo ==========================================
echo Setup Complete
echo ==========================================
pause
