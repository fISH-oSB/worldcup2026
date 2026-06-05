@echo off
echo Starting World Cup 2026 in DEV mode (hot reload)...

SET NODE_PATH=C:\Program Files\nodejs

REM Start backend
start "WC2026 Backend" cmd /k "SET PATH=%NODE_PATH%;%PATH% && cd /d "%~dp0backend" && node server.js"

REM Start frontend dev server
start "WC2026 Frontend" cmd /k "SET PATH=%NODE_PATH%;%PATH% && cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause
