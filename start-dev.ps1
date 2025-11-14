# GitHub ReBAC System - Development Startup Script
# This script starts both the backend and frontend in separate terminals

Write-Host "Starting GitHub ReBAC System..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists in root
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if node_modules exists in ui
if (-not (Test-Path "ui/node_modules")) {
    Write-Host "Installing UI dependencies..." -ForegroundColor Yellow
    npm install --prefix ui
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
Write-Host "- Backend API will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Frontend UI will run on http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop the services" -ForegroundColor Yellow
Write-Host ""

# Start backend in new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Starting Backend API...' -ForegroundColor Green; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend in new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/ui'; Write-Host 'Starting Frontend UI...' -ForegroundColor Green; npm run dev"

Write-Host "Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser to http://localhost:5173 to access the UI" -ForegroundColor Cyan
Write-Host ""
