@echo off
setlocal

set SETTINGS=%~dp0local-settings.cmd

echo @echo off> "%SETTINGS%"
echo set CLASSROOM_N8N_PUBLIC_URL=https://unallowable-lustrelessly-pok.ngrok-free.dev>> "%SETTINGS%"
echo set CLASSROOM_NGROK_DOMAIN=unallowable-lustrelessly-pok.ngrok-free.dev>> "%SETTINGS%"

echo.
echo Created:
echo %SETTINGS%
echo.
echo This file is local and ignored by git.
pause

endlocal
