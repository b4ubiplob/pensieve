#!/bin/bash

# Pensieve Application Startup Script
# This script builds and runs both backend and frontend in preview mode

set -e  # Exit on error

# Cleanup function to ensure backend is killed
cleanup() {
    echo ""
    echo "========================================"
    echo "Shutting down services..."
    echo "========================================"

    if [ ! -z "$BACKEND_PID" ] && ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        # Wait for process to terminate
        sleep 2
        # Force kill if still running
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "Force stopping backend..."
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo "Backend stopped."
    fi

    if [ ! -z "$FRONTEND_PID" ] && ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 1
        echo "Frontend stopped."
    fi

    echo "Application stopped successfully."
    exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

echo "========================================"
echo "Starting Pensieve Application Setup"
echo "========================================"

# Set environment variables for PREVIEW mode
export FRONTEND_URL=http://localhost:4173

# Check if required environment variables are set
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "ERROR: GOOGLE_CLIENT_ID environment variable is not set"
    echo "Please set it using: export GOOGLE_CLIENT_ID=your-client-id"
    exit 1
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "ERROR: GOOGLE_CLIENT_SECRET environment variable is not set"
    echo "Please set it using: export GOOGLE_CLIENT_SECRET=your-client-secret"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET environment variable is not set"
    echo "Please set it using: export JWT_SECRET=your-jwt-secret"
    echo "Or generate one with: export JWT_SECRET=\$(openssl rand -base64 64)"
    exit 1
fi

echo "Environment variables configured:"
echo "  MODE: PRODUCTION (PREVIEW)"
echo "  FRONTEND_URL: $FRONTEND_URL"
echo "  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "  JWT_SECRET: [HIDDEN]"
echo ""

# Build Backend
echo "========================================"
echo "Building Backend (Maven)"
echo "========================================"
cd pensieve
mvn clean package -DskipTests
echo "Backend build completed successfully!"
echo ""

# Build Frontend
echo "========================================"
echo "Building Frontend (npm)"
echo "========================================"
cd ../pensieve_web
npm run build
echo "Frontend build completed successfully!"
echo ""

# Start Backend in background
echo "========================================"
echo "Starting Backend Server"
echo "========================================"
cd ../pensieve
echo "Running: java -jar target/pensieve-1.0.0.jar"
java -jar target/pensieve-1.0.0.jar > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
echo "Backend logs: pensieve/backend.log"
echo ""

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 10

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "Backend is running!"
else
    echo "ERROR: Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start Frontend in preview mode
echo "========================================"
echo "Starting Frontend Server (Preview Mode)"
echo "========================================"
cd ../pensieve_web
echo "Running: npm run preview"
echo "Frontend will be available at: http://localhost:4173"
echo "Backend API available at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both frontend and backend"
echo ""
echo "========================================"

# Start frontend in foreground (trap will handle cleanup)
npm run preview
