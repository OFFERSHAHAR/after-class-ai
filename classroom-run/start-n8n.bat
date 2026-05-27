@echo off
setlocal

set ROOT=%~dp0..
set N8N_PORT=5678
set N8N_DATA=%ROOT%\.n8n-classroom

if exist "%~dp0local-settings.cmd" call "%~dp0local-settings.cmd"

set N8N_HOST=0.0.0.0
set N8N_PORT=%N8N_PORT%
set N8N_LISTEN_ADDRESS=0.0.0.0
set N8N_USER_FOLDER=%N8N_DATA%
set N8N_DIAGNOSTICS_ENABLED=false
set N8N_VERSION_NOTIFICATIONS_ENABLED=false
if not "%CLASSROOM_N8N_PUBLIC_URL%"=="" set WEBHOOK_URL=%CLASSROOM_N8N_PUBLIC_URL%/

where n8n >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  n8n start
  goto :end
)

where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  npx n8n start
  goto :end
)

echo.
echo Could not start n8n.
echo Install once:
echo npm install -g n8n
echo.
pause

:end
endlocal
