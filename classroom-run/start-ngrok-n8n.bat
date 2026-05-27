@echo off
setlocal

set NGROK=%~dp0tools\ngrok.exe
set N8N_PORT=5678

if exist "%~dp0local-settings.cmd" call "%~dp0local-settings.cmd"

if not "%CLASSROOM_NGROK_EDGE%"=="" (
  "%NGROK%" tunnel --label edge=%CLASSROOM_NGROK_EDGE% http://localhost:%N8N_PORT%
  goto :end
)

if not "%CLASSROOM_NGROK_DOMAIN%"=="" (
  "%NGROK%" http --url=https://%CLASSROOM_NGROK_DOMAIN% %N8N_PORT%
  goto :end
)

"%NGROK%" http %N8N_PORT%

:end

endlocal
