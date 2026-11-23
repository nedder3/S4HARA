@echo off
chcp 65001 >nul
title Instalador de S4HARA - Simulador SAP S/4HANA
color 0B

echo ==============================================================
echo   INSTALADOR DE S4HARA - SIMULADOR SAP S/4HANA LOGISTICS
echo   Windows 10 / 11 - Cero dependencias (No requiere Node.js)
echo ==============================================================
echo.

set "INSTALL_DIR=%LOCALAPPDATA%\S4HARA"
set "SOURCE_DIR=%~dp0"

echo [1/4] Preparando carpeta de instalacion en:
echo       %INSTALL_DIR%
if exist "%INSTALL_DIR%" (
    rmdir /s /q "%INSTALL_DIR%"
)
mkdir "%INSTALL_DIR%\app" >nul 2>&1

echo [2/4] Copiando aplicacion y motor local...
xcopy "%SOURCE_DIR%app\*" "%INSTALL_DIR%\app\" /E /I /Y /Q >nul
copy /Y "%SOURCE_DIR%S4HARA_Launcher.ps1" "%INSTALL_DIR%\S4HARA_Launcher.ps1" >nul
copy /Y "%SOURCE_DIR%Desinstalar_S4HARA.bat" "%INSTALL_DIR%\Desinstalar_S4HARA.bat" >nul

echo [3/4] Creando lanzador de escritorio...
(
echo @echo off
echo title S4HARA - Servidor Local
echo powershell -NoProfile -ExecutionPolicy Bypass -File "%%LOCALAPPDATA%%\S4HARA\S4HARA_Launcher.ps1"
) > "%INSTALL_DIR%\Iniciar_S4HARA.bat"

echo [4/4] Creando accesos directos en Escritorio y Menu Inicio...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$sc = $ws.CreateShortcut((Join-Path $desktop 'S4HARA - Simulador SAP.lnk')); " ^
  "$sc.TargetPath = '%INSTALL_DIR%\Iniciar_S4HARA.bat'; " ^
  "$sc.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$sc.WindowStyle = 7; " ^
  "$sc.Description = 'Simulador interactivo SAP S/4HANA Logistics'; " ^
  "$sc.IconLocation = 'shell32.dll,13'; " ^
  "$sc.Save(); " ^
  "$startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\S4HARA'; " ^
  "New-Item -ItemType Directory -Force -Path $startMenu | Out-Null; " ^
  "$sc2 = $ws.CreateShortcut((Join-Path $startMenu 'S4HARA - Simulador SAP.lnk')); " ^
  "$sc2.TargetPath = '%INSTALL_DIR%\Iniciar_S4HARA.bat'; " ^
  "$sc2.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$sc2.WindowStyle = 7; " ^
  "$sc2.IconLocation = 'shell32.dll,13'; " ^
  "$sc2.Save(); " ^
  "$sc3 = $ws.CreateShortcut((Join-Path $startMenu 'Desinstalar S4HARA.lnk')); " ^
  "$sc3.TargetPath = '%INSTALL_DIR%\Desinstalar_S4HARA.bat'; " ^
  "$sc3.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$sc3.IconLocation = 'shell32.dll,31'; " ^
  "$sc3.Save();"

echo.
echo ==============================================================
echo   INSTALACION COMPLETADA CON EXITO!
echo   Ya tienes el acceso directo "S4HARA - Simulador SAP" en tu
echo   Escritorio y en el Menu Inicio.
echo ==============================================================
echo.
set /p RUNNOW="Deseas abrir S4HARA ahora mismo? (S/N): "
if /I "%RUNNOW%"=="S" (
    start "" /min "%INSTALL_DIR%\Iniciar_S4HARA.bat"
)
exit /b 0
