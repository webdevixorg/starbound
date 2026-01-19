#!/bin/bash

# --- Configuration ---
TARGET_USER="webdevix"
TARGET_IP="145.223.21.26"
TARGET_PATH="/var/www/starbound"
APP_NAME="logivis"  # Matches your logivis.service name
DB_NAME="logivis"
REMOTE_SQL_PATH="${TARGET_PATH}/data/starbound.backup"
EXCLUDE_FILE="rsync-exclude.txt"

# --- SSH Connection Sharing ---
CONTROL_PATH="/tmp/ssh-mux-%r@%h:%p"
SSH_OPTS="-o ControlMaster=auto -o ControlPersist=60s -o ControlPath=${CONTROL_PATH}"

# --- Pre-flight Checks ---
# Extract DB password from backend .env file to set it for the PG user
if [ ! -f "config/backend/.env" ]; then
    echo -e "${YELLOW}Error: config/backend/.env file not found. Aborting.${NC}"
    exit 1
fi
# Use grep and cut to safely extract the password value, and tr to remove Windows carriage returns
DB_PASSWORD=$(grep -E '^DB_PASSWORD=' config/backend/.env | cut -d '=' -f2- | tr -d '\r')
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}Error: DB_PASSWORD not found or is empty in config/backend/.env. Aborting.${NC}"
    exit 1
fi
# SQL-escape the password to handle special characters like single quotes
DB_PASSWORD_SQL_ESCAPED="${DB_PASSWORD//\'/\'\'}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' 

set -e # Exit immediately if a command fails

echo -e "${BLUE}=== Starting Production Deployment to $TARGET_IP ===${NC}\n"

# 1. Build Frontend Locally
echo -e "${BLUE}Building frontend locally to save server resources...${NC}"
# Copy production config to .env.local so it takes precedence during build
cp config/frontend/.env.local frontend/.env.local
(cd frontend && npm install && npm run build)
# Remove the production .env.local after build to prevent accidental usage in local dev
rm frontend/.env.local
echo -e "${GREEN}✓ Frontend built successfully.${NC}\n"


# 2. Sync Files to VPS
echo -e "${BLUE}Syncing files and environment configs to VPS...${NC}"
# Ensure remote directory exists
ssh -t ${SSH_OPTS} ${TARGET_USER}@${TARGET_IP} "sudo mkdir -p ${TARGET_PATH} && sudo chown -R ${TARGET_USER}:${TARGET_USER} ${TARGET_PATH}"

# Sync folders
rsync -e "ssh ${SSH_OPTS}" -avz --delete --exclude-from="$EXCLUDE_FILE" --exclude=".git" ./backend/ ${TARGET_USER}@${TARGET_IP}:${TARGET_PATH}/backend/
rsync -e "ssh ${SSH_OPTS}" -avz --delete --exclude-from="$EXCLUDE_FILE" --exclude=".git" ./frontend/ ${TARGET_USER}@${TARGET_IP}:${TARGET_PATH}/frontend/
rsync -e "ssh ${SSH_OPTS}" -avz --delete ./data/ ${TARGET_USER}@${TARGET_IP}:${TARGET_PATH}/data/

# Copy .env files from your specific config folders
scp ${SSH_OPTS} config/backend/.env ${TARGET_USER}@${TARGET_IP}:${TARGET_PATH}/backend/.env
scp ${SSH_OPTS} config/frontend/.env.local ${TARGET_USER}@${TARGET_IP}:${TARGET_PATH}/frontend/.env.local

# Prepare and upload systemd files
echo -e "${BLUE}Preparing configuration files...${NC}"
cp config/systemd/gunicorn.socket .app.socket
cp config/systemd/gunicorn.service .app.service
cp config/nginx/logivis .app.nginx

# Replace variables in the local copies
sed -i "s|APP_NAME|${APP_NAME}|g" .app.socket
sed -i "s|TARGET_USER|${TARGET_USER}|g" .app.socket

sed -i "s|APP_NAME|${APP_NAME}|g" .app.service
sed -i "s|TARGET_USER|${TARGET_USER}|g" .app.service
sed -i "s|TARGET_PATH|${TARGET_PATH}|g" .app.service

sed -i "s|APP_NAME|${APP_NAME}|g" .app.nginx
sed -i "s|TARGET_PATH|${TARGET_PATH}|g" .app.nginx

# Upload them
scp ${SSH_OPTS} .app.socket ${TARGET_USER}@${TARGET_IP}:~/${APP_NAME}.socket
scp ${SSH_OPTS} .app.service ${TARGET_USER}@${TARGET_IP}:~/${APP_NAME}.service
scp ${SSH_OPTS} .app.nginx ${TARGET_USER}@${TARGET_IP}:~/${APP_NAME}.nginx

# Clean up local temps
rm .app.socket .app.service .app.nginx

echo -e "${GREEN}✓ Sync complete.${NC}\n"

# 3. Remote Operations
echo -e "${BLUE}Executing remote setup and service restarts...${NC}"

# Create a temporary script for remote execution
cat > .remote_script.sh << 'EOF_SCRIPT'
    set -e
    
    # FIX PATH ISSUES: Ensure common binary paths are available
    export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
    
    # Create Systemd socket and service files
    echo "Installing Gunicorn socket file for APP_NAME..."
    sudo mv ~/APP_NAME.socket /etc/systemd/system/APP_NAME.socket
    sudo chown root:root /etc/systemd/system/APP_NAME.socket

    echo "Installing Gunicorn service file for APP_NAME..."
    sudo mv ~/APP_NAME.service /etc/systemd/system/APP_NAME.service
    sudo chown root:root /etc/systemd/system/APP_NAME.service

    # Install Nginx Config
    echo "Installing Nginx configuration..."
    if ! command -v nginx &> /dev/null; then
        echo "Nginx not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y nginx
    fi
    
    sudo mv ~/APP_NAME.nginx /etc/nginx/sites-available/APP_NAME
    sudo chown root:root /etc/nginx/sites-available/APP_NAME
    sudo ln -sf /etc/nginx/sites-available/APP_NAME /etc/nginx/sites-enabled/APP_NAME
    # Remove default site if it exists to avoid conflicts
    # sudo rm -f /etc/nginx/sites-enabled/default 
    
    sudo systemctl daemon-reload
    sudo systemctl reload nginx

    # Create Log Directory
    echo "Setting up log directory /var/log/APP_NAME..."
    sudo mkdir -p /var/log/APP_NAME
    sudo touch /var/log/APP_NAME/django.log
    sudo chown -R TARGET_USER:www-data /var/log/APP_NAME
    sudo chmod -R 775 /var/log/APP_NAME

    # --- PostgreSQL Service Handling ---
    
    # Ensure PostgreSQL client and server are installed
    if ! command -v psql &> /dev/null; then
        echo "PostgreSQL tools not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib postgresql-client
    fi

    # Find the correct PostgreSQL service name *after* potential installation
    PG_SERVICE=$(systemctl list-unit-files --type=service | grep '^postgresql.*\\.service' | head -n 1 | awk '{print $1}')

    if [ -z "$PG_SERVICE" ]; then
        echo "Warning: Could not automatically find PostgreSQL service. Attempting to use a default."
        PG_SERVICE="postgresql"
    fi
    
    echo "Using PostgreSQL service: $PG_SERVICE"
    
    # Ensure Postgres service is running and enabled
    if ! sudo systemctl is-active --quiet "$PG_SERVICE"; then
        echo "Enabling and starting $PG_SERVICE..."
        sudo systemctl enable --now "$PG_SERVICE"
    else
        echo "$PG_SERVICE is already active."
    fi

    # Database Management
    # Ensure the PostgreSQL role for the deploy user exists and has the correct password.
    # This prevents authentication failures when Django tries to connect.
    if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='TARGET_USER'" | grep -q 1; then
        echo "Creating PostgreSQL superuser role for TARGET_USER..."
        # Use psql to create the user with a password directly.
        sudo -u postgres psql -c "CREATE USER TARGET_USER WITH SUPERUSER PASSWORD 'DB_PASSWORD_PLACEHOLDER';"
    else
        echo "PostgreSQL role TARGET_USER exists. Ensuring password is up to date..."
        # If user exists, just update the password.
        sudo -u postgres psql -c "ALTER USER TARGET_USER WITH PASSWORD 'DB_PASSWORD_PLACEHOLDER';"
    fi

    # Create the database, owned by our user.
    if ! psql -lqt | cut -d \| -f 1 | grep -qw DB_NAME; then
        echo "Creating database DB_NAME for user TARGET_USER..."
        # The 'createdb' command will be run by TARGET_USER, who is now a superuser.
        createdb DB_NAME
    fi

    # Seed if database is empty
    TABLE_COUNT=$(psql -d DB_NAME -tqc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
    if [ "$TABLE_COUNT" -eq 0 ]; then
        echo "Seeding database with starbound.sql..."
        psql -d DB_NAME -f REMOTE_SQL_PATH
    fi

    # Backend Environment Setup
    cd TARGET_PATH/backend
    python3 -m venv venv
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r requirements.txt
    ./venv/bin/python manage.py migrate
    ./venv/bin/python manage.py collectstatic --noinput

    # Restart Services
    echo "Restarting Gunicorn and PM2..."
    sudo systemctl enable --now APP_NAME.socket
    sudo systemctl restart APP_NAME.service
    
    # --- FIREWALL CONFIGURATION ---
    echo "Configuring firewall to allow local traffic..."
    # Allow Nginx to connect to the Next.js app on port 3000
    sudo ufw allow 3000/tcp
    sudo ufw reload
    
    # --- NODE.JS & PM2 SETUP ---
    # Ensure Node.js and PM2 are installed and in path
    export PATH=$PATH:/usr/local/bin:/usr/bin
    
    if ! command -v node &> /dev/null; then
        echo "Node.js not found. Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    if ! command -v pm2 &> /dev/null; then
        echo "PM2 not found. Installing globally..."
        sudo npm install -g pm2
    fi
    
    cd TARGET_PATH/frontend
    echo "Installing production frontend dependencies..."
    # We use --omit=dev because the app is already built and dev dependencies are not needed.
    npm ci --omit=dev
    
    if pm2 list | grep -q "starbound-frontend"; then
        echo "Reloading existing PM2 process for pre-built app..."
        pm2 reload starbound-frontend
    else
        echo "Starting new PM2 process for pre-built app..."
        # 'npm start' will run 'next start' using the build artifacts from your local machine.
        pm2 start npm --name "starbound-frontend" -- start
    fi
    
    # Save the PM2 process list to be respawned on reboot
    pm2 save
EOF_SCRIPT

# Replace placeholders in the temporary script
sed -i "s|APP_NAME|${APP_NAME}|g" .remote_script.sh
sed -i "s|TARGET_USER|${TARGET_USER}|g" .remote_script.sh
sed -i "s|TARGET_PATH|${TARGET_PATH}|g" .remote_script.sh
sed -i "s|DB_NAME|${DB_NAME}|g" .remote_script.sh
sed -i "s|REMOTE_SQL_PATH|${REMOTE_SQL_PATH}|g" .remote_script.sh
sed -i "s|DB_PASSWORD_PLACEHOLDER|${DB_PASSWORD_SQL_ESCAPED}|g" .remote_script.sh

# Upload and execute the script
echo -e "${BLUE}Uploading and executing remote script...${NC}"
scp ${SSH_OPTS} .remote_script.sh ${TARGET_USER}@${TARGET_IP}:~/deploy_script.sh
ssh -t ${SSH_OPTS} ${TARGET_USER}@${TARGET_IP} "bash ~/deploy_script.sh && rm ~/deploy_script.sh"
rm .remote_script.sh

echo -e "\n${GREEN}=== Deployment Successful! ===${NC}"
echo -e "Live at: ${BLUE}https://logivis.com${NC}"