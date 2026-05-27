@echo off
setlocal

set ROOT=%~dp0..
set SERVE_ROOT=%ROOT%\..
set UI_PORT=5174

cd /d "%SERVE_ROOT%"
python -m http.server %UI_PORT% --bind 0.0.0.0 --directory "%SERVE_ROOT%"

endlocal

