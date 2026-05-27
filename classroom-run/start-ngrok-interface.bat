@echo off
setlocal

set NGROK=%~dp0tools\ngrok.exe
set UI_PORT=5174

"%NGROK%" http %UI_PORT%

endlocal

