@echo off
REM =========================================================================
REM  CourseForge - Frontend Launcher
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
echo Starting CourseForge Vite React Frontend...
npm run dev
pause
