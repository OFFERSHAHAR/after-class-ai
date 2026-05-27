@echo off
setlocal

set ROOT=%~dp0..
set UI_PORT=5174
set N8N_PORT=5678
set NGROK=%~dp0tools\ngrok.exe

echo.
echo After Class AI - Tomorrow Class Launcher
echo ----------------------------------------
echo.

echo 1. Starting classroom interface...
start "After Class AI - Interface" "%~dp0start-interface.bat"

echo 2. Starting n8n workspace...
start "After Class AI - n8n" "%~dp0start-n8n.bat"

echo 3. Waiting before tunnels...
timeout /t 8 /nobreak >nul

if exist "%NGROK%" (
  echo 4. Starting public tunnels...
  start "After Class AI - ngrok UI" "%~dp0start-ngrok-interface.bat"
  timeout /t 2 /nobreak >nul
  start "After Class AI - ngrok n8n" "%~dp0start-ngrok-n8n.bat"
  timeout /t 4 /nobreak >nul
  call "%~dp0SHOW_PUBLIC_LINKS.bat"
) else (
  echo.
  echo ngrok.exe was not found.
  echo Put it here:
  echo %NGROK%
  echo.
  echo Local network links:
  echo Interface: http://10.0.0.1:%UI_PORT%/after-class-ai/
  echo n8n:       http://10.0.0.1:%N8N_PORT%/
)

echo.
echo Keep all opened windows running during class.
echo.
pause
endlocal

