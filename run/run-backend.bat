@echo off
REM =========================================================================
REM  CourseForge - Backend Launcher
REM =========================================================================
cd /d "%~dp0\..\src\backend"
if not exist "bin" mkdir bin
echo Compiling latest backend code...
javac -encoding UTF-8 -cp "lib/*" -d bin ^
  src/main/java/com/courseforge/Main.java ^
  src/main/java/com/courseforge/model/Models.java ^
  src/main/java/com/courseforge/server/ApiServer.java ^
  src/main/java/com/courseforge/server/AuthService.java ^
  src/main/java/com/courseforge/server/Json.java ^
  src/main/java/com/courseforge/store/Database.java ^
  src/main/java/com/courseforge/store/SeedData.java
if errorlevel 1 (
    echo Backend compilation failed.
    pause
    exit /b 1
)

echo Starting CourseForge Relational Backend...
java -cp "bin;lib/*" com.courseforge.Main
pause
