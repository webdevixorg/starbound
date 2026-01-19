    set -e
    
    # FIX PATH ISSUES: Ensure common binary paths are available
    export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
    
    # Create Systemd socket and service files
    echo "Installing Gunicorn socket file for logivis..."
    sudo mv ~/logivis.socket /etc/systemd/system/logivis.socket
    sudo chown root:root /etc/systemd/system/logivis.socket

    echo "Installing Gunicorn service file for logivis..."
    sudo mv ~/logivis.service /etc/systemd/system/logivis.service
    sudo chown root:root /etc/systemd/system/logivis.service

    # Install Nginx Config
    echo "Installing Nginx configuration..."
    if ! command -v nginx &> /dev/null; then
        echo "Nginx not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y nginx
    fi
    
    sudo mv ~/logivis.nginx /etc/nginx/sites-available/logivis
    sudo chown root:root /etc/nginx/sites-available/logivis
    sudo ln -sf /etc/nginx/sites-available/logivis /etc/nginx/sites-enabled/logivis
    # Remove default site if it exists to avoid conflicts
    # sudo rm -f /etc/nginx/sites-enabled/default 
    
    sudo systemctl daemon-reload
    sudo systemctl reload nginx

    # Create Log Directory
    echo "Setting up log directory /var/log/logivis..."
    sudo mkdir -p /var/log/logivis
    sudo touch /var/log/logivis/django.log
    sudo chown -R webdevix:www-data /var/log/logivis
    sudo chmod -R 775 /var/log/logivis

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
    if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='webdevix'" | grep -q 1; then
        echo "Creating PostgreSQL superuser role for webdevix..."
        # Use psql to create the user with a password directly.
        sudo -u postgres psql -c "CREATE USER webdevix WITH SUPERUSER PASSWORD 'wdd@1230588';"
    else
        echo "PostgreSQL role webdevix exists. Ensuring password is up to date..."
        # If user exists, just update the password.
        sudo -u postgres psql -c "ALTER USER webdevix WITH PASSWORD 'wdd@1230588';"
    fi

    # Create the database, owned by our user.
    if ! psql -lqt | cut -d \| -f 1 | grep -qw logivis; then
        echo "Creating database logivis for user webdevix..."
        # The 'createdb' command will be run by webdevix, who is now a superuser.
        createdb logivis
    fi

    # Seed if database is empty
    TABLE_COUNT=$(psql -d logivis -tqc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
    if [ "$TABLE_COUNT" -eq 0 ]; then
        echo "Seeding database with starbound.sql..."
        psql -d logivis -f /var/www/starbound/data/starbound.backup
    fi

    # Backend Environment Setup
    cd /var/www/starbound/backend
    python3 -m venv venv
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r requirements.txt
    ./venv/bin/python manage.py migrate
    ./venv/bin/python manage.py collectstatic --noinput

    # Restart Services
    echo "Restarting Gunicorn and PM2..."
    sudo systemctl enable --now logivis.socket
    sudo systemctl restart logivis.service
    
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
    
    cd /var/www/starbound/frontend
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
