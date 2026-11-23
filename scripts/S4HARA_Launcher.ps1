param(
    [string]$AppDir = "$PSScriptRoot\app",
    [int]$StartPort = 4173,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RootPath = (Resolve-Path $AppDir).Path

# Find an available localhost port
$Port = $StartPort
$Listener = $null
while ($Port -le ($StartPort + 20)) {
    try {
        $testListener = New-Object System.Net.HttpListener
        $testListener.Prefixes.Add("http://127.0.0.1:$Port/")
        $testListener.Start()
        $Listener = $testListener
        break
    } catch {
        $Port++
    }
}

if (-not $Listener) {
    Write-Host "ERROR: No se pudo encontrar un puerto local disponible ($StartPort..$($StartPort+20))." -ForegroundColor Red
    Pause
    exit 1
}

$Url = "http://127.0.0.1:$Port/"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  S4HARA - Simulador SAP S/4HANA Logistics (Local)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Servidor local activo en: $Url" -ForegroundColor Green
Write-Host "  Tus datos se guardan automaticamente en tu PC." -ForegroundColor Gray
Write-Host "  Manten esta ventana minimizada mientras usas S4HARA." -ForegroundColor Yellow
Write-Host "  Para cerrar el simulador, simplemente cierra esta ventana." -ForegroundColor Yellow
Write-Host ""

# Launch in Edge or Chrome App Mode for native desktop look, fallback to default browser
$EdgePaths = @(
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$ChromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$BrowserExe = ($EdgePaths + $ChromePaths) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $NoBrowser) {
    if ($BrowserExe) {
        Start-Process -FilePath $BrowserExe -ArgumentList "--app=$Url"
    } else {
        Start-Process $Url
    }
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".json" = "application/json; charset=utf-8"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        try {
            $RelPath = $Request.Url.AbsolutePath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($RelPath)) {
                $RelPath = "index.html"
            }

            $Candidate = Join-Path $RootPath ($RelPath -replace '/', '\')
            $FullPath = [System.IO.Path]::GetFullPath($Candidate)

            # Security: prevent path traversal outside $RootPath
            if (-not $FullPath.StartsWith($RootPath, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $FullPath -PathType Leaf)) {
                $FullPath = Join-Path $RootPath "index.html"
            }

            $Ext = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }

            $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
            $Response.ContentType = $ContentType
            $Response.ContentLength64 = $Bytes.Length
            $Response.StatusCode = 200
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } catch {
            $Response.StatusCode = 500
        } finally {
            $Response.OutputStream.Close()
        }
    }
} finally {
    if ($Listener) {
        $Listener.Stop()
        $Listener.Close()
    }
}
