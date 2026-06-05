@echo off
echo Starting World Cup 2026 Prediction App...
echo.

SET NODE_PATH=C:\Program Files\nodejs

REM Start backend
start "WC2026 Backend" cmd /k "SET PATH=%NODE_PATH%;%PATH% && cd /d "%~dp0backend" && node server.js"

REM Wait a moment then open browser
timeout /t 2 /nobreak >nul

REM Open the app (production: served by backend on port 3001)
start "" "http://localhost:3001"

echo Backend started on http://localhost:3001
echo.
echo Press any key to exit this window...
pause >nul
