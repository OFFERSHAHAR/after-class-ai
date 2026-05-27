@echo off
setlocal

set PORT=5180
set ROOT=%~dp0

echo.
echo After Class AI - Student Kit
echo ----------------------------
echo Starting local practice server...
echo.

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" http://127.0.0.1:%PORT%/
  py -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" http://127.0.0.1:%PORT%/
  python -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

echo Python was not found on this computer.
echo Install Python from https://www.python.org/downloads/
echo Then run this file again.
pause

:end
endlocal

