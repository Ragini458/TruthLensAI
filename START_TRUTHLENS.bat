@echo off
title TruthLens AI Launcher

echo ========================================
echo          TRUTHLENS AI
echo ========================================
echo.
echo Starting Flask backend...

start "TruthLens AI - Backend" cmd /k "cd /d D:\TruthLensAI\backend && D:\TruthLensAI\venv\Scripts\python.exe app.py"

timeout /t 3 /nobreak >nul

echo Starting website server...

start "TruthLens AI - Website" cmd /k "cd /d D:\TruthLensAI\website && D:\TruthLensAI\venv\Scripts\python.exe -m http.server 5500"

timeout /t 2 /nobreak >nul

echo Opening TruthLens AI in your browser...

start "" "http://127.0.0.1:5500"

echo.
echo TruthLens AI is starting...
echo Keep both server windows open while using the website.
echo.
pause
