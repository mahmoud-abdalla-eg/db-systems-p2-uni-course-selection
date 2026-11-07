@echo off
REM =========================================================================
REM  Uni Course Selection - Frontend Launcher
REM =========================================================================
cd /d "%~dp0\..\src\frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo Frontend dependency installation failed.
        pause
        exit /b 1
    )
)
echo Starting Uni Course Selection frontend...
npm run dev
pause
