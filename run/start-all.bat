@echo off
echo Starting CourseForge...
echo Backend: http://localhost:8080/api
echo Frontend: http://localhost:5173

start "CourseForge Backend" cmd /k call "%~dp0run-backend.bat"
timeout /t 2 /nobreak >nul
start "CourseForge Frontend" cmd /k call "%~dp0run-frontend.bat"

echo Services launched. Open http://localhost:5173 in your browser.
