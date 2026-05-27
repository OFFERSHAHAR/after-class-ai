$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "After Class AI public links"
Write-Host "---------------------------"
Write-Host ""

$response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"

if (-not $response -or -not $response.tunnels) {
  Write-Host "No tunnel data found."
  Write-Host "Make sure ngrok windows are open."
  exit 0
}

foreach ($tunnel in $response.tunnels) {
  $publicUrl = $tunnel.public_url
  $localUrl = $tunnel.config.addr

  if ($localUrl -like "*5174*") {
    Write-Host "Class interface:"
    Write-Host "$publicUrl/after-class-ai/"
    Write-Host ""
  }

  if ($localUrl -like "*5678*") {
    Write-Host "n8n workspace:"
    Write-Host "$publicUrl"
    Write-Host ""
  }
}

Write-Host "Local fallback:"
Write-Host "http://10.0.0.1:5174/after-class-ai/"
Write-Host "http://10.0.0.1:5678/"

