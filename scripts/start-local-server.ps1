$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$logsDirectory = Join-Path $projectRoot "logs"
$serverLog = Join-Path $logsDirectory "server.log"
$errorLog = Join-Path $logsDirectory "server-error.log"
$buildLog = Join-Path $logsDirectory "build.log"

New-Item -ItemType Directory -Force -Path $logsDirectory | Out-Null
Set-Location -LiteralPath $projectRoot

$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  exit 0
}

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot ".next\BUILD_ID"))) {
  & npm.cmd run build *>> $buildLog
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

& npm.cmd run start -- --hostname 127.0.0.1 --port 3000 1>> $serverLog 2>> $errorLog
exit $LASTEXITCODE
