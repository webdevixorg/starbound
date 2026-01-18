# scripts/init_db.ps1
# Automates PostgreSQL database creation, user creation, and population

$ErrorActionPreference = "Stop"

# --- Configuration ---
if (Test-Path "backend/.env") {
    $EnvFile = "backend/.env"
} else {
    $EnvFile = "config/backend/.env"
}
$SqlFile = "data/Starbound_pg.sql"

# --- Helper: Parse .env ---
function Get-EnvVar {
    param($File, $Name)
    if (Test-Path $File) {
        $val = Select-String -Path $File -Pattern "^$Name=(.*)"
        if ($val) { return $val.Matches.Groups[1].Value.Trim() }
    }
    return $null
}

# --- Main Logic ---

# 1. Resolve Configuration from .env
$DbName = Get-EnvVar $EnvFile "DB_NAME"
$DbUser = Get-EnvVar $EnvFile "DB_USER"
$DbPassword = Get-EnvVar $EnvFile "DB_PASSWORD"

if (-not $DbName) { $DbName = "starbound" }
if (-not $DbUser) { $DbUser = "postgres" }

Write-Host "Config: Database='$DbName', User='$DbUser'" -ForegroundColor Cyan

# 2. Check for psql
if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
    Write-Warning "PostgreSQL tools (psql) not found in PATH. Skipping setup."
    exit 0
}

# 3. Create User if missing
# Note: We assume 'postgres' superuser access. You might be prompted for a password.
$userExists = psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DbUser'" 2>$null
if ($userExists -ne "1") {
    Write-Host "User '$DbUser' does not exist. Creating..." -ForegroundColor Yellow
    try {
        # Create user with password
        psql -U postgres -c "CREATE USER $DbUser WITH PASSWORD '$DbPassword';"
        psql -U postgres -c "ALTER USER $DbUser CREATEDB;" # Allow user to create DBs
        Write-Host "User '$DbUser' created successfully." -ForegroundColor Green
    } catch {
        Write-Error "Failed to create user. Ensure you have permissions or 'postgres' password."
    }
} else {
    Write-Host "User '$DbUser' already exists." -ForegroundColor Green
}

# 4. Create and Populate Database
$dbExists = psql -U postgres -lqt | Select-String "\b$DbName\b"

if (-not $dbExists) {
    Write-Host "Database '$DbName' does not exist. Creating..." -ForegroundColor Yellow
    try {
        # Create DB with the correct owner
        createdb -U postgres -O $DbUser $DbName
        Write-Host "Database created." -ForegroundColor Green
        
        if (Test-Path $SqlFile) {
            Write-Host "Populating from '$SqlFile'..." -ForegroundColor Yellow
            # Use the new user to populate, or postgres if necessary
            $env:PGPASSWORD = $DbPassword
            psql -U $DbUser -d $DbName -f $SqlFile
            $env:PGPASSWORD = $null # Clear password
            Write-Host "Population complete!" -ForegroundColor Green
        } else {
            Write-Warning "SQL dump file '$SqlFile' not found. Database created but empty."
        }
    } catch {
        Write-Error "Failed to create/populate database."
    }
} else {
    Write-Host "Database '$DbName' already exists. Skipping creation." -ForegroundColor Green
}
