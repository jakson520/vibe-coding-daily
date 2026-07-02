@echo off
setlocal
set "URL=http://127.0.0.1:3000/"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
  start "" "%EDGE%" --new-window --user-data-dir="%TEMP%\vibe-coding-daily-edge" "%URL%"
  exit /b 0
)

start "" "%URL%"
