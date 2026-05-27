@echo off
setlocal

set UI_PORT=5174
set N8N_PORT=5678
set ROOT=%~dp0..
set N8N_DATA=%ROOT%\.n8n-classroom

echo.
echo After Class AI - Classroom Server
echo --------------------------------
echo.

for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  set SERVER_IP=%%A
  goto :got_ip
)

:got_ip
set SERVER_IP=%SERVER_IP: =%
if "%SERVER_IP%"=="" set SERVER_IP=127.0.0.1

echo Classroom UI:
echo http://%SERVER_IP%:%UI_PORT%/after-class-ai/
echo.
echo n8n:
echo http://%SERVER_IP%:%N8N_PORT%/
echo.

echo Starting classroom UI server...
start "After Class AI UI" "%~dp0run-ui-server.bat"

echo Starting n8n server...
start "After Class AI n8n" "%~dp0run-n8n-server.bat"

:done
echo.
echo Server windows opened.
echo Keep them open during class.
echo.
pause
endlocal
