#!/bin/bash

# Unified Repository Analyzer Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/packages/backend/.env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking deployment requirements..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi

    log_success "All requirements are met"
}

check_environment() {
    log_info "Checking environment configuration..."

    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found. Creating from example..."
        cp "$PROJECT_ROOT/packages/backend/.env.example" "$ENV_FILE"
        log_warning "Please edit $ENV_FILE with your configuration before continuing."
        exit 1
    fi

    # Check for required environment variables in production
    if [ "$NODE_ENV" = "production" ]; then
        required_vars=("JWT_SECRET" "SESSION_SECRET" "ENCRYPTION_KEY")
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$ENV_FILE" || grep -q "^$var=your_" "$ENV_FILE"; then
                log_error "Required environment variable $var is not properly configured"
                exit 1
            fi
        done
    fi

    log_success "Environment configuration is valid"
}

build_application() {
    log_info "Building application..."

    cd "$PROJECT_ROOT"

    # Install dependencies
    log_info "Installing dependencies..."
    bun ci

    # Run tests
    log_info "Running tests..."
    bun run test

    # Build application
    log_info "Building production bundles..."
    bun run build:prod

    log_success "Application built successfully"
}

build_docker_images() {
    log_info "Building Docker images..."

    cd "$PROJECT_ROOT"

    # Build images
    "$DOCKER_COMPOSE_FILE" build --no-cache

    log_success "Docker images built successfully"
}

deploy_application() {
    log_info "Deploying application..."

    cd "$PROJECT_ROOT"

    # Stop existing containers
    log_info "Stopping existing containers..."
    "$DOCKER_COMPOSE_FILE" down

    # Start new containers
    log_info "Starting new containers..."
    "$DOCKER_COMPOSE_FILE" up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10

    # Check health
    if "$DOCKER_COMPOSE_FILE" ps | grep -q "unhealthy"; then
        log_error "Some services are unhealthy"
        "$DOCKER_COMPOSE_FILE" logs
        exit 1
    fi

    log_success "Application deployed successfully"
}

run_health_checks() {
    log_info "Running health checks..."

    # Check backend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        exit 1
    fi

    # Check frontend
    if curl -f http://localhost/ > /dev/null 2>&1; then
        log_success "Frontend is accessible"
    else
        log_error "Frontend health check failed"
        exit 1
    fi

    log_success "All health checks passed"
}

show_status() {
    log_info "Deployment status:"
    "$DOCKER_COMPOSE_FILE" ps

    echo ""
    log_info "Application URLs:"
    echo "  Frontend: http://localhost/"
    echo "  Backend API: http://localhost:3000/"
    echo "  Health Check: http://localhost:3000/health"
    echo "  Metrics: http://localhost:3000/metrics"

    echo ""
    log_info "Useful commands:"
    echo "  View logs: \"$DOCKER_COMPOSE_FILE\" logs -f"
    echo "  Stop services: \"$DOCKER_COMPOSE_FILE\" down"
    echo "  Restart services: \"$DOCKER_COMPOSE_FILE\" restart"
}

# Main deployment process
main() {
    log_info "Starting deployment process..."

    check_requirements
    check_environment
    build_application
    build_docker_images
    deploy_application
    run_health_checks
    show_status

    log_success "Deployment completed successfully!"
}

# Handle command line arguments
case "${1:-deploy}" in
    "check")
        check_requirements
        check_environment
        ;;
    "build")
        check_requirements
        build_application
        ;;
    "docker")
        check_requirements
        build_docker_images
        ;;
    "deploy")
        main
        ;;
    "health")
        run_health_checks
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 {check|build|docker|deploy|health|status}"
        echo ""
        echo "Commands:"
        echo "  check   - Check deployment requirements and environment"
        echo "  build   - Build the application"
        echo "  docker  - Build Docker images"
        echo "  deploy  - Full deployment (default)"
        echo "  health  - Run health checks"
        echo "  status  - Show deployment status"
        exit 1
        ;;
esac
