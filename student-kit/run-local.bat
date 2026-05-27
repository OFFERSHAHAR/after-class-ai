@echo off
setlocal

set PORT=5180
set ROOT=%~dp0
set URL=http://127.0.0.1:%PORT%/

echo.
echo After Class AI - Student Kit
echo ----------------------------
echo Starting local practice workspace...
echo.

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Opening %URL%
  start "" %URL%
  py -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Opening %URL%
  start "" %URL%
  python -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

echo Python was not found.
echo Opening the student kit directly as a file.
echo Some browser features may be limited without a local server.
echo.
start "" "%ROOT%index.html"
echo.
echo Recommended later: install Python from https://www.python.org/downloads/
echo Then this button will run the full local server.
pause

:end
endlocal
