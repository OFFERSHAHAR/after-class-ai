@echo off
setlocal

set NGROK=%~dp0tools\ngrok.exe

if not exist "%NGROK%" (
  echo ngrok.exe was not found here:
  echo %NGROK%
  echo.
  echo Put ngrok.exe inside classroom-run\tools first.
  pause
  goto :end
)

echo.
echo Paste your ngrok auth token.
echo It will be saved by ngrok on this computer, not in the project files.
echo.
set /p NGROK_TOKEN=Token: 

"%NGROK%" config add-authtoken %NGROK_TOKEN%

echo.
echo ngrok auth was configured.
pause

:end
endlocal
