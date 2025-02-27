#!/bin/bash

# Function to check and fix Docker permissions
check_docker_permissions() {
  # Check if user can access Docker
  if ! docker info > /dev/null 2>&1; then
    echo "Docker permission issue detected. Attempting to fix..."
    
    # Check if docker group exists
    if ! getent group docker > /dev/null; then
      echo "Docker group not found. Creating..."
      sudo groupadd docker
    fi
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Set socket permissions
    if [ -S /var/run/docker.sock ]; then
      echo "Setting Docker socket permissions..."
      sudo chmod 666 /var/run/docker.sock
    fi
    
    echo "Docker permissions have been updated"
  fi
}

DB_USER="postgres"
DB_PASSWORD="postgres"
CONTAINER_NAME="timesheet-postgres"
DB_DATA_DIR="$HOME/timesheet_data/postgres"

PORT=5432

# Function to check if port is in use
check_port() {
  if lsof -i :$PORT > /dev/null; then
    echo "Port $PORT is already in use. Stopping PostgreSQL processes..."
    # Stop system PostgreSQL service
    sudo systemctl stop postgresql 2>/dev/null || true
    
    # Find and kill any user-level postgres processes
    echo "Checking for user-level postgres processes..."
    if pgrep -u $USER postgres > /dev/null; then
      echo "Found postgres processes running under current user"
      pkill -u $USER postgres
    fi
    
    # Wait for port to be available
    echo "Waiting for port $PORT to be available..."
    for i in {1..30}; do
      if ! lsof -i :$PORT > /dev/null; then
        echo "Port $PORT is now available"
            return 0
        fi
        sleep 1
    done
    
    echo "Failed to free up port $PORT after 30 seconds"
    echo "Please check what process is using it with: sudo lsof -i :$PORT"
    echo "You may need to manually kill the process:"
    echo "sudo pkill -u $USER postgres"
    exit 1
  fi
}

# Create data directory if it doesn't exist
mkdir -p "$DB_DATA_DIR"

# Load database name from .env file
if [ -f "backend/.env" ]; then
  # Extract DB_NAME from DATABASE_URL
  DB_NAME=$(grep DATABASE_URL backend/.env | cut -d'/' -f4)
  # Extract DB_USER from DATABASE_URL (between // and :)
  DB_USER=$(grep DATABASE_URL backend/.env | cut -d'/' -f3 | cut -d':' -f1)
  # Extract DB_PASSWORD from DATABASE_URL (between : and @)
  DB_PASSWORD=$(grep DATABASE_URL backend/.env | cut -d':' -f3 | cut -d'@' -f1)
  
  if [ -z "$DB_NAME" ]; then
    echo "Could not find database name in backend/.env"
    exit 1
  fi
  if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Could not find database credentials in backend/.env"
    exit 1
  fi
else
  echo "backend/.env file not found"
  exit 1
fi

case "$1" in
  "start")
    # Check Docker permissions first
    check_docker_permissions

    # Check and free up port if needed
    check_port

    # Check if container exists
    if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
      if [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
        # Restart existing container
        echo "Restarting existing database container..."
        # Try to remove if start fails
        docker start $CONTAINER_NAME || {
          echo "Failed to start container, trying to remove and recreate..."
          docker rm $CONTAINER_NAME
          docker run --name $CONTAINER_NAME \
            -e POSTGRES_DB=$DB_NAME \
            -e POSTGRES_USER=$DB_USER \
            -e POSTGRES_PASSWORD=$DB_PASSWORD \
            -p $PORT:$PORT \
            -v "$DB_DATA_DIR":/var/lib/postgresql/data \
            -d postgres:15
        }
      else
        # Create new container if it doesn't exist
        echo "Creating new database container..."
        # Remove any existing container with same name first
        docker rm -f $CONTAINER_NAME 2>/dev/null || true
        docker run --name $CONTAINER_NAME \
          -e POSTGRES_DB=$DB_NAME \
          -e POSTGRES_USER=$DB_USER \
          -e POSTGRES_PASSWORD=$DB_PASSWORD \
          -p $PORT:$PORT \
          -v "$DB_DATA_DIR":/var/lib/postgresql/data \
          -d postgres:15
      fi
    else
      echo "Database container is already running"
    fi
    ;;
    
  "stop")
    echo "Stopping database container..."
    docker stop $CONTAINER_NAME
    ;;

  "reset")
    echo "Resetting database..."
    # Check Docker permissions first
    check_docker_permissions

    # Check and free up port if needed
    check_port
    
    # Stop and remove existing container
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # Remove local data directory
    echo "Removing local data directory..."
    sudo rm -rf "$DB_DATA_DIR"
    sudo mkdir -p "$DB_DATA_DIR"
    sudo chown $USER:$USER "$DB_DATA_DIR"
    
    # Create fresh container
    echo "Creating new database container..."
    docker run --name $CONTAINER_NAME \
      -e POSTGRES_DB="$DB_NAME" \
      -e POSTGRES_USER=$DB_USER \
      -e POSTGRES_PASSWORD=$DB_PASSWORD \
      -p $PORT:$PORT \
      -v "$DB_DATA_DIR":/var/lib/postgresql/data \
      -d postgres:15
    
    echo "Waiting for database to be ready..."
    sleep 3
    echo "Database reset complete"
    ;;

  "status")
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
      echo "Database is running"
      # Show connection details
      echo "Connection Details:"
      echo "  Host: localhost"
      echo "  Port: $PORT"
      echo "  Database: $DB_NAME"
      echo "  User: $DB_USER"
      docker logs $CONTAINER_NAME --tail 5
    elif [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
      echo "Database container exists but is not running"
    else
      echo "Database container does not exist"
    fi
    ;;
    
  *)
    echo "Usage: $0 {start|stop|reset|status}"
    exit 1
    ;;
esac 
