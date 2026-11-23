@echo off
chcp 65001 >nul
title S4HARA - Modo Portable
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0S4HARA_Launcher.ps1" -AppDir "%~dp0app"
