#!/bin/bash

set -e

# --------------------------------------------------
# Must run as root
# --------------------------------------------------
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: Run with sudo."
    exit 1
fi

# --------------------------------------------------
# Detect real user
# --------------------------------------------------
if [ -n "$SUDO_USER" ]; then
    USER_NAME="$SUDO_USER"
else
    USER_NAME=$(whoami)
fi

HOME_DIR=$(eval echo "~$USER_NAME")

PROJECT_RELATIVE_PATH="kmd/kmd_web/web_service"
PROJECT_DIR="$HOME_DIR/$PROJECT_RELATIVE_PATH"

VENV_DIR="$PROJECT_DIR/venv"

GUNICORN_BIN="$VENV_DIR/bin/gunicorn"

SOCKET_FILE="$PROJECT_DIR/web_service.sock"

GUNICORN_SERVICE="gunicorn"
GUNICORN_UNIT="/etc/systemd/system/$GUNICORN_SERVICE.service"

NGINX_CONF="/etc/nginx/sites-available/rsmc.conf"
NGINX_LINK="/etc/nginx/sites-enabled/rsmc.conf"

FRONTEND_DIR="$HOME_DIR/kmd/kmd_web/web_front/client/dist"

# --------------------------------------------------
# Check nginx installed
# --------------------------------------------------
if ! command -v nginx &> /dev/null
then
    echo "ERROR: nginx is not installed"
    exit 1
fi

# --------------------------------------------------
# Check gunicorn installed in venv
# --------------------------------------------------
if [ ! -f "$GUNICORN_BIN" ]; then
    echo "ERROR: gunicorn is not installed in the virtual environment"
    echo "Activate venv and run:"
    echo "pip install gunicorn"
    exit 1
fi

echo "✅ nginx and gunicorn detected"

# --------------------------------------------------
# Create gunicorn log dir
# --------------------------------------------------
mkdir -p /var/log/gunicorn
chown $USER_NAME:$USER_NAME /var/log/gunicorn

# --------------------------------------------------
# Create gunicorn service (with TimeoutStartSec)
# --------------------------------------------------
cat > "$GUNICORN_UNIT" <<EOL
[Unit]
Description=Gunicorn daemon for RSMC Django
After=network.target

[Service]
User=$USER_NAME
Group=www-data
WorkingDirectory=$PROJECT_DIR

ExecStart=$GUNICORN_BIN \
          --workers 3 \
          --bind unix:$SOCKET_FILE \
          --access-logfile /var/log/gunicorn/rsmc_access.log \
          --error-logfile /var/log/gunicorn/rsmc_error.log \
          rsmc_config.config.wsgi:application

# Give app enough time to start
TimeoutStartSec=30

Restart=always
RestartSec=5

LimitNOFILE=65535
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd immediately to avoid "command vanished" issues
systemctl daemon-reload
systemctl restart $GUNICORN_SERVICE || true

echo "✅ Created $GUNICORN_UNIT, TimeoutStartSec=30 and reloaded systemd"

# --------------------------------------------------
# Create nginx config
# --------------------------------------------------
cat > "$NGINX_CONF" <<EOL
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL certificate paths (Certbot)
    #ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    #ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # fallback to self-signed cert for local testing
    ssl_certificate /etc/ssl/localcerts/nginx-self.crt;
    ssl_certificate_key /etc/ssl/localcerts/nginx-self.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # -----------------------------
    # Frontend (React build)
    # -----------------------------
    root $FRONTEND_DIR;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    # -----------------------------
    # Backend (Django)
    # -----------------------------
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:$SOCKET_FILE;
    }

    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:$SOCKET_FILE;
    }

    # -----------------------------
    # Static files
    # -----------------------------
    location /static/ {
        alias $PROJECT_DIR/staticfiles/;
        expires 30d;
        access_log off;
    }

    # -----------------------------
    # Media
    # -----------------------------
    location /media/ {
        alias /home/$USER_NAME/kmd/kmd_web/web_service/media/;
        access_log off;
    }

    location /uploads/ {
        alias /home/$USER_NAME/uploads/;
        autoindex off;
        access_log off;
    }
    # Optional gzip
        gzip on;
        gzip_types text/plain application/javascript application/json text/css image/svg+xml;
        gzip_min_length 256;
    # -----------------------------
    # Logs
    # -----------------------------
    access_log /var/log/nginx/rsmc_access.log;
    error_log /var/log/nginx/rsmc_error.log;
    #sudo apt update
    #sudo apt install certbot python3-certbot-nginx -y

    #sudo certbot --nginx -d myreal.domain.com -d www.myreal.domain.com
}
EOL

echo "✅ Created $NGINX_CONF"

# --------------------------------------------------
# Enable site
# --------------------------------------------------
if [ ! -L "$NGINX_LINK" ]; then
    ln -s "$NGINX_CONF" "$NGINX_LINK"
    echo "✅ Enabled nginx site"
fi

# --------------------------------------------------
# Test nginx
# --------------------------------------------------
echo "🔎 Testing nginx configuration..."
nginx -t

# --------------------------------------------------
# Reload systemd
# --------------------------------------------------
systemctl daemon-reload

# --------------------------------------------------
# Start gunicorn
# --------------------------------------------------
systemctl enable --now $GUNICORN_SERVICE

# --------------------------------------------------
# Reload nginx
# --------------------------------------------------
systemctl restart nginx

echo ""
echo "🚀 Deployment completed successfully"
echo ""

echo "Gunicorn status:"
systemctl status gunicorn --no-pager

echo ""
echo "Nginx status:"
systemctl status nginx --no-pager

echo ""
echo "📊 Logs:"
echo "journalctl -u gunicorn -f"