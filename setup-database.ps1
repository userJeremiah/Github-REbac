# PostgreSQL Database Setup Script
# Run this after installing PostgreSQL

Write-Host "🚀 GitHub ReBAC Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$dbName = "github_rebac"
$dbUser = "postgres"
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

# Check if PostgreSQL is installed
if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ PostgreSQL not found at: $psqlPath" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first or update the path in this script." -ForegroundColor Yellow
    Write-Host "See POSTGRESQL_SETUP.md for installation instructions." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL found" -ForegroundColor Green

# Check if service is running
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL service not running" -ForegroundColor Yellow
    Write-Host "Attempting to start service..." -ForegroundColor Yellow
    try {
        Start-Service postgresql-x64-16 -ErrorAction Stop
        Write-Host "✅ Service started" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start service. Please start it manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📝 Please enter your PostgreSQL password (set during installation):" -ForegroundColor Cyan
$password = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "🗄️  Creating database..." -ForegroundColor Cyan

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $plainPassword

# Check if database exists
$checkDb = & $psqlPath -U $dbUser -lqt | Select-String -Pattern $dbName
if ($checkDb) {
    Write-Host "⚠️  Database '$dbName' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        & $psqlPath -U $dbUser -c "DROP DATABASE $dbName;" 2>$null
        Write-Host "Creating new database..." -ForegroundColor Cyan
        & $psqlPath -U $dbUser -c "CREATE DATABASE $dbName;"
    }
} else {
    & $psqlPath -U $dbUser -c "CREATE DATABASE $dbName;"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Running migrations..." -ForegroundColor Cyan

# Run migrations
$migrations = @(
    "migrations/001_initial_schema.sql",
    "migrations/002_teams.sql",
    "migrations/003_pull_requests.sql",
    "migrations/004_audit_logs.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "  Running $migration..." -ForegroundColor Gray
        & $psqlPath -U $dbUser -d $dbName -f $migration 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $migration completed" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $migration failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ⚠️  $migration not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔧 Updating .env file..." -ForegroundColor Cyan

# Update .env file
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $newConnectionString = "DATABASE_URL=postgresql://$dbUser:$plainPassword@localhost:5432/$dbName"
    
    if ($envContent -match "DATABASE_URL=.*") {
        $envContent = $envContent -replace "DATABASE_URL=.*", $newConnectionString
        Set-Content $envFile $envContent -NoNewline
        Write-Host "✅ .env file updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  DATABASE_URL not found in .env" -ForegroundColor Yellow
        Write-Host "Please add this line to your .env file:" -ForegroundColor Yellow
        Write-Host $newConnectionString -ForegroundColor White
    }
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Verifying tables..." -ForegroundColor Cyan

# List tables
$env:PGPASSWORD = $plainPassword
& $psqlPath -U $dbUser -d $dbName -c "\dt" 2>&1

$env:PGPASSWORD = $null

Write-Host ""
Write-Host "✅ Setup complete! Your database is ready." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your server: npm run dev" -ForegroundColor White
Write-Host "2. Look for: ✅ Database connected" -ForegroundColor White
Write-Host "3. Test creating repositories with real data!" -ForegroundColor White
Write-Host ""
