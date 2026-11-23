@echo off
chcp 65001 >nul
title Desinstalador de S4HARA
color 0E

echo ==============================================================
echo   DESINSTALADOR DE S4HARA - SIMULADOR SAP S/4HANA
echo ==============================================================
echo.
set /p CONFIRM="Seguro que deseas desinstalar S4HARA de esta PC? (S/N): "
if /I not "%CONFIRM%"=="S" exit /b 0

echo Eliminando accesos directos...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $desktop 'S4HARA - Simulador SAP.lnk'); " ^
  "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\S4HARA');"

echo Eliminando archivos del programa...
set "INSTALL_DIR=%LOCALAPPDATA%\S4HARA"
start "" /b cmd /c "timeout /t 2 /nobreak >nul & rmdir /s /q "%INSTALL_DIR%""

echo.
echo S4HARA ha sido desinstalado correctamente.
timeout /t 3 >nul
exit /b 0
