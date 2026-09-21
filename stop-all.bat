@echo off
title Stop RailBlock AI Services
color 0c
echo ====================================================================
echo             STOPPING ALL RAILBLOCK AI CLOUD SERVICES
echo ====================================================================
echo.
taskkill /F /IM cloudflared.exe /T >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 :3000 :3001"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] All RailBlock AI services and tunnels have been stopped cleanly.
timeout /t 2 /nobreak >nul
