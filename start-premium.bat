@echo off
title AS Store Premium - Launch System
color 0B
cls
echo =====================================================================
echo                AS STORE PREMIUM MANAGEMENT SUITE                     
echo =====================================================================
echo [System] Enforcing Secure bcrypted SQLite storage...
echo [System] Starting API backend server...
echo =====================================================================

:: Start backend in a separate terminal window
start "AS Store Premium - Backend API" cmd /k "cd as-store-premium\backend && echo Starting Express API Server... && npm run start"

:: Wait 3 seconds for database migrations to execute
timeout /t 3 /nobreak >null

echo =====================================================================
echo [System] Starting Vite React Client...
echo =====================================================================

:: Start frontend in a separate terminal window
start "AS Store Premium - Frontend Client" cmd /k "cd as-store-premium\frontend && echo Starting Vite React App... && npm run dev"

:: Wait 2 seconds for Vite bundler to initiate
timeout /t 2 /nobreak >null

echo =====================================================================
echo [System] Launching browser at http://localhost:3000...
echo =====================================================================
start http://localhost:3000

echo.
echo Complete! You can close this window now. The servers will continue running.
echo.
pause
