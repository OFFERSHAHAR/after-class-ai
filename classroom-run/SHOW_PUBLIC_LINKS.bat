@echo off
setlocal

powershell -ExecutionPolicy Bypass -File "%~dp0show-public-links.ps1"

echo.
pause
endlocal

