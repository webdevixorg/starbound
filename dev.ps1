# dev.ps1 - Start Development Environment on Windows

Write-Host "=== Starbound Development Launcher ===" -ForegroundColor Cyan

# --- 1. Backend Setup ---
Write-Host "Checking Backend..." -ForegroundColor Yellow
Push-Location backend

# Check for Linux venv (incompatible with Windows)
if (Test-Path "venv/bin") {
    Write-Error "Error: Found a Linux virtual environment in 'backend/venv'. Windows cannot use this."
    Write-Warning "Please delete the 'backend/venv' folder and run this script again to create a Windows compatible one."
    Pop-Location
    exit 1
}

# Create Windows venv if missing
if (Test-Path "venv") {
    # Check if the venv is valid
    try {
        $test = & .\venv\Scripts\python.exe -c "print('ok')" 2>$null
        if ($test -ne 'ok') { throw "Broken" }
    } catch {
        Write-Warning "Existing virtual environment is broken or incompatible. Recreating..."
        Remove-Item -Path "venv" -Recurse -Force
    }
}

if (-not (Test-Path "venv")) {
    Write-Host "Creating new Python virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create venv. Is Python installed?"; exit 1 }
}

# Install requirements
Write-Host "Ensuring backend requirements are installed..."
.\venv\Scripts\python.exe -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install backend requirements."; exit 1 }

Pop-Location

# --- 2. Frontend Setup ---
Write-Host "Checking Frontend..." -ForegroundColor Yellow
Push-Location frontend

# Install node_modules if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install frontend dependencies. Is Node.js installed?"; exit 1 }
}

Pop-Location

# --- 3. Start Servers ---
Write-Host "Starting Servers..." -ForegroundColor Green

# Start Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {
    $host.UI.RawUI.WindowTitle = 'Starbound Backend (Django)';
    
    # 1. Initialize Database (Create & Populate)
    Write-Host 'Initializing Database...' -ForegroundColor Cyan;
    if (Test-Path 'scripts/init_db.ps1') {
        powershell -ExecutionPolicy Bypass -File scripts/init_db.ps1
    }

    # 2. Setup Django Environment
    Write-Host 'Starting Django Server...' -ForegroundColor Green;
    cd backend;
    
    if (Test-Path 'venv/Scripts/activate.ps1') {
        . ./venv/Scripts/activate
    }
    
    # 3. Migrate
    Write-Host 'Running Migrations...' -ForegroundColor Cyan;
    python manage.py migrate;
    
    # 4. Start Server
    python manage.py runserver
}"

# Start Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {
    $host.UI.RawUI.WindowTitle = 'Starbound Frontend (Next.js)';
    Write-Host 'Starting Next.js Server...' -ForegroundColor Green;
    cd frontend;
    npm run dev
}"

Write-Host "Done! Servers are starting in new windows." -ForegroundColor Cyan
Write-Host "Backend API: http://127.0.0.1:8000/api/"
Write-Host "Frontend:    http://localhost:3000"
