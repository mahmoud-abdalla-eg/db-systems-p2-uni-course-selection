# CourseForge - PowerShell Master Launcher
Write-Host "Starting CourseForge..." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8080/api" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow

Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "call `"$PSScriptRoot\run-backend.bat`""
Start-Sleep -Seconds 2
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "call `"$PSScriptRoot\run-frontend.bat`""

Write-Host "Services launched. Open http://localhost:5173 in your browser." -ForegroundColor Green
