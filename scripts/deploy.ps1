# Unified Repository Analyzer Deployment Script (PowerShell)
# This script handles the complete deployment process on Windows

param(
    [Parameter(Position = 0)]
    [ValidateSet("check", "build", "docker", "deploy", "health", "status")]
    [string]$Command = "deploy"
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DockerComposeFile = Join-Path $ProjectRoot "docker-compose.yml"
$EnvFile = Join-Path $ProjectRoot "packages\backend\.env"

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Requirements {
    Write-Info "Checking deployment requirements..."

    # Check if Docker is installed
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }

    # Check if Docker Compose is available
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not available. Please ensure Docker Desktop is running."
        exit 1
    }

    # Check if Node.js is installed
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js first."
        exit 1
    }

    # Check if npm is installed
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }

    Write-Success "All requirements are met"
}

function Test-Environment {
    Write-Info "Checking environment configuration..."

    if (-not (Test-Path $EnvFile)) {
        Write-Warning "Environment file not found. Creating from example..."
        $ExampleFile = Join-Path $ProjectRoot "packages\backend\.env.example"
        Copy-Item $ExampleFile $EnvFile
        Write-Warning "Please edit $EnvFile with your configuration before continuing."
        exit 1
    }

    # Check for required environment variables in production
    if ($env:NODE_ENV -eq "production") {
        $RequiredVars = @("JWT_SECRET", "SESSION_SECRET", "ENCRYPTION_KEY")
        $EnvContent = Get-Content $EnvFile

        foreach ($Var in $RequiredVars) {
            $Found = $EnvContent | Where-Object { $_ -match "^$Var=" -and $_ -notmatch "^$Var=your_" }
            if (-not $Found) {
                Write-Error "Required environment variable $Var is not properly configured"
                exit 1
            }
        }
    }

    Write-Success "Environment configuration is valid"
}

function Build-Application {
    Write-Info "Building application..."

    Set-Location $ProjectRoot

    # Install dependencies
    Write-Info "Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }

    # Run tests
    Write-Info "Running tests..."
    npm run test
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed"
        exit 1
    }

    # Build application
    Write-Info "Building production bundles..."
    npm run build:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }

    Write-Success "Application built successfully"
}

function Build-DockerImages {
    Write-Info "Building Docker images..."

    Set-Location $ProjectRoot

    # Build images
    docker-compose build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build Docker images"
        exit 1
    }

    Write-Success "Docker images built successfully"
}

function Deploy-Application {
    Write-Info "Deploying application..."

    Set-Location $ProjectRoot

    # Stop existing containers
    Write-Info "Stopping existing containers..."
    docker-compose down

    # Start new containers
    Write-Info "Starting new containers..."
    docker-compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start containers"
        exit 1
    }

    # Wait for services to be healthy
    Write-Info "Waiting for services to be healthy..."
    Start-Sleep -Seconds 10

    # Check health
    $Status = docker-compose ps
    if ($Status -match "unhealthy") {
        Write-Error "Some services are unhealthy"
        docker-compose logs
        exit 1
    }

    Write-Success "Application deployed successfully"
}

function Test-Health {
    Write-Info "Running health checks..."

    # Check backend health
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
        if ($Response.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
        else {
            Write-Error "Backend health check failed with status $($Response.StatusCode)"
            exit 1
        }
    }
    catch {
        Write-Error "Backend health check failed: $($_.Exception.Message)"
        exit 1
    }

    # Check frontend
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing -TimeoutSec 10
        if ($Response.StatusCode -eq 200) {
            Write-Success "Frontend is accessible"
        }
        else {
            Write-Error "Frontend health check failed with status $($Response.StatusCode)"
            exit 1
        }
    }
    catch {
        Write-Error "Frontend health check failed: $($_.Exception.Message)"
        exit 1
    }

    Write-Success "All health checks passed"
}

function Show-Status {
    Write-Info "Deployment status:"
    docker-compose ps

    Write-Host ""
    Write-Info "Application URLs:"
    Write-Host "  Frontend: http://localhost/"
    Write-Host "  Backend API: http://localhost:3000/"
    Write-Host "  Health Check: http://localhost:3000/health"
    Write-Host "  Metrics: http://localhost:3000/metrics"

    Write-Host ""
    Write-Info "Useful commands:"
    Write-Host "  View logs: docker-compose logs -f"
    Write-Host "  Stop services: docker-compose down"
    Write-Host "  Restart services: docker-compose restart"
}

function Invoke-MainDeployment {
    Write-Info "Starting deployment process..."

    Test-Requirements
    Test-Environment
    Build-Application
    Build-DockerImages
    Deploy-Application
    Test-Health
    Show-Status

    Write-Success "Deployment completed successfully!"
}

# Main execution
switch ($Command) {
    "check" {
        Test-Requirements
        Test-Environment
    }
    "build" {
        Test-Requirements
        Build-Application
    }
    "docker" {
        Test-Requirements
        Build-DockerImages
    }
    "deploy" {
        Invoke-MainDeployment
    }
    "health" {
        Test-Health
    }
    "status" {
        Show-Status
    }
    default {
        Write-Host "Usage: .\deploy.ps1 {check|build|docker|deploy|health|status}"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  check   - Check deployment requirements and environment"
        Write-Host "  build   - Build the application"
        Write-Host "  docker  - Build Docker images"
        Write-Host "  deploy  - Full deployment (default)"
        Write-Host "  health  - Run health checks"
        Write-Host "  status  - Show deployment status"
        exit 1
    }
}