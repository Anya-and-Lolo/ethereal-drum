@echo off
title Ethereal Drum Trainer
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0app-files\watch-song-catalogs.ps1"
if errorlevel 1 (
  echo.
  echo The trainer could not start. Please keep this window open and take a screenshot of the message above.
  pause
)
