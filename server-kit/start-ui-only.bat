@echo off
setlocal

set UI_PORT=5174
set ROOT=%~dp0..

for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  set SERVER_IP=%%A
  goto :got_ip
)

:got_ip
set SERVER_IP=%SERVER_IP: =%
if "%SERVER_IP%"=="" set SERVER_IP=127.0.0.1

echo After Class AI UI:
echo http://%SERVER_IP%:%UI_PORT%/after-class-ai/
echo.

python -m http.server %UI_PORT% --bind 0.0.0.0 --directory "%ROOT%\.."

endlocal

