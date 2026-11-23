$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $Root "dist"
$ReleaseRoot = Join-Path $Root "release"
$StagingDir = Join-Path $ReleaseRoot "S4HARA-Windows"
$ZipPath = Join-Path $ReleaseRoot "S4HARA-Windows-Installer.zip"

if (-not (Test-Path $DistDir)) {
    throw "No se encontro la carpeta dist/. Ejecuta 'npm run build' primero."
}

if (Test-Path $StagingDir) { Remove-Item -Recurse -Force $StagingDir }
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }

New-Item -ItemType Directory -Force -Path (Join-Path $StagingDir "app") | Out-Null

# Copy production build
Copy-Item -Path (Join-Path $DistDir "*") -Destination (Join-Path $StagingDir "app") -Recurse -Force

# Copy Windows installer & portable launcher scripts
@(
    "S4HARA_Launcher.ps1",
    "Instalar_S4HARA.bat",
    "Desinstalar_S4HARA.bat",
    "Ejecutar_Sin_Instalar.bat",
    "LEEME_INSTRUCCIONES.txt"
) | ForEach-Object {
    Copy-Item -Path (Join-Path $PSScriptRoot $_) -Destination (Join-Path $StagingDir $_) -Force
}

# Create distributable ZIP
Compress-Archive -Path (Join-Path $StagingDir "*") -DestinationPath $ZipPath -CompressionLevel Optimal

$SizeKB = [math]::Round((Get-Item $ZipPath).Length / 1KB, 1)
Write-Host ""
Write-Host "Empaquetado Windows 10/11 completado:" -ForegroundColor Green
Write-Host "  ZIP: $ZipPath ($SizeKB KB)" -ForegroundColor Cyan
