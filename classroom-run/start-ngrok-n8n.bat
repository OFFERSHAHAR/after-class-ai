@echo off
setlocal

set NGROK=%~dp0tools\ngrok.exe
set N8N_PORT=5678

"%NGROK%" http %N8N_PORT%

endlocal

