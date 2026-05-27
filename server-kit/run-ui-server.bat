@echo off
setlocal

set UI_PORT=5174
set PROJECT_ROOT=%~dp0..
set SERVE_ROOT=%PROJECT_ROOT%\..

cd /d "%SERVE_ROOT%"
python -m http.server %UI_PORT% --bind 0.0.0.0 --directory "%SERVE_ROOT%"

endlocal

