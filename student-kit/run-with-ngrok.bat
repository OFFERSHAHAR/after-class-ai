@echo off
setlocal

set PORT=5180
set ROOT=%~dp0
set NGROK=%ROOT%tools\ngrok.exe
set URL=http://127.0.0.1:%PORT%/

echo.
echo After Class AI - Student Kit + ngrok
echo ------------------------------------
echo This starts the local student kit and opens an optional public tunnel.
echo.

if not exist "%NGROK%" (
  echo ngrok.exe was not found here:
  echo %NGROK%
  echo.
  echo Download ngrok for Windows and place ngrok.exe inside:
  echo %ROOT%tools
  echo.
  echo The local student kit will still open now.
  start "" "%ROOT%run-local.bat"
  pause
  goto :end
)

start "After Class AI Local Server" "%ROOT%run-local.bat"
timeout /t 3 /nobreak >nul
start "After Class AI ngrok Tunnel" "%NGROK%" http %PORT%

echo.
echo Local URL:
echo %URL%
echo.
echo ngrok will show a public forwarding URL in the new window.
echo Use it only when the teacher asks for a public URL.
echo.
pause

:end
endlocal
