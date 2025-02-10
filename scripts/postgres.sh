#!/bin/bash

# Find PostgreSQL installation
if command -v pg_config > /dev/null; then
    PG_BIN=$(pg_config --bindir)
else
    echo "PostgreSQL is not installed or pg_config is not in PATH"
    exit 1
fi

PGDATA=~/postgres_data
LOGFILE=~/postgres_data/logfile
PORT=5432
SOCKET_DIR="$PGDATA/sockets"

cleanup_data_directory() {
    if [ -d "$PGDATA" ]; then
        echo "Stopping any running PostgreSQL instance..."
        "$PG_BIN/pg_ctl" -D "$PGDATA" stop > /dev/null 2>&1 || true
        
        echo "Removing existing data directory..."
        rm -rf "$PGDATA"
    fi
}

initialize_database() {

    echo "Initializing PostgreSQL database cluster..."
    "$PG_BIN/initdb" \
        --pgdata="$PGDATA" \
        --username=postgres \
        --auth=trust \
        --encoding=UTF8 \
        --locale=en_US.UTF-8 \
        --no-instructions

    if [ $? -ne 0 ]; then
        echo "Failed to initialize database cluster"
        exit 1
    fi

#    echo "Creating data directory..."
#    mkdir -p "$PGDATA"
#    chmod 700 "$PGDATA"
    
    echo "Creating socket directory..."
    mkdir -p "$SOCKET_DIR"
    chmod 700 "$SOCKET_DIR"
    
    echo "Creating log directory..."
    mkdir -p "$(dirname "$LOGFILE")"


    # Configure postgresql.conf
    cat > "$PGDATA/postgresql.conf" << EOF
port = $PORT
listen_addresses = 'localhost'
unix_socket_directories = '$SOCKET_DIR'
EOF
    
    # Configure client authentication
    cat > "$PGDATA/pg_hba.conf" << EOF
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
EOF
}

create_db_if_not_exists() {
    echo "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if "$PG_BIN/pg_isready" -h localhost -p $PORT > /dev/null 2>&1; then
            echo "Creating database if it doesn't exist..."
            PGHOST=localhost "$PG_BIN/createdb" -U postgres time_reporting 2>/dev/null || true
            return 0
        fi
        sleep 1
    done
    echo "Timeout waiting for PostgreSQL to be ready"
    return 1
}

case "$1" in
  start)
#    cleanup_data_directory
#    initialize_database

    echo "Starting PostgreSQL..."
    "$PG_BIN/pg_ctl" -D "$PGDATA" -l "$LOGFILE" -o "-p $PORT" start
    
    if [ $? -eq 0 ]; then
        create_db_if_not_exists
        echo "PostgreSQL is running on port $PORT"
    else
        echo "Failed to start PostgreSQL. Check the log file: $LOGFILE"
        if [ -f "$LOGFILE" ]; then
            cat "$LOGFILE"
        fi
        exit 1
    fi
    ;;
  stop)
    if [ -d "$PGDATA" ]; then
        echo "Stopping PostgreSQL..."
        "$PG_BIN/pg_ctl" -D "$PGDATA" stop
    else
        echo "PostgreSQL is not running"
    fi
    ;;
  status)
    if [ -d "$PGDATA" ]; then
        "$PG_BIN/pg_ctl" -D "$PGDATA" status
    else
        echo "PostgreSQL is not initialized"
        exit 1
    fi
    ;;
  reset)
    cleanup_data_directory
    initialize_database

    echo "Starting PostgreSQL..."
    "$PG_BIN/pg_ctl" -D "$PGDATA" -l "$LOGFILE" -o "-p $PORT" start
    
    if [ $? -eq 0 ]; then
        create_db_if_not_exists
        echo "PostgreSQL is running on port $PORT"
    else
        echo "Failed to start PostgreSQL. Check the log file: $LOGFILE"
        if [ -f "$LOGFILE" ]; then
            cat "$LOGFILE"
        fi
        exit 1
    fi
    ;;
    
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac 
