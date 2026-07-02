@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -Command "$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($listener) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  if not exist "%~dp0logs" mkdir "%~dp0logs"
  start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\start-local-server.ps1"
)

for /l %%i in (1,1,90) do (
  powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 goto open_site
  powershell -NoProfile -Command "Start-Sleep -Seconds 1"
)

echo Vibe Coding Daily has not started yet.
echo Please check logs\server-error.log for error messages.
pause
exit /b 1

:open_site
if /I "%VIBE_SKIP_OPEN%"=="1" exit /b 0
call "%~dp002-open-in-edge.bat"
