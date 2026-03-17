#!/bin/bash

set -e

# --------------------------------------------------
# Validate argument
# --------------------------------------------------
if [ $# -ne 1 ]; then
    echo "Usage: sudo ./watch-and-celery.sh /path/to/envfile"
    exit 1
fi

ENV_FILE="$1"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: Env file not found: $ENV_FILE"
    exit 1
fi

# --------------------------------------------------
# Required variables
# --------------------------------------------------
REQUIRED_VARS=(
DJANGO_SECRET_KEY
DB_PASSWORD
EMAIL_HOST_PASSWORD
REDIS_URL
DJANGO_SETTINGS_MODULE
)

# --------------------------------------------------
# Validate env file content
# --------------------------------------------------
for VAR in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${VAR}=" "$ENV_FILE"; then
        echo "ERROR: Missing required variable in env file: $VAR"
        exit 1
    fi
done

echo "✅ Env file validation passed"

# --------------------------------------------------
# Warn about permissions
# --------------------------------------------------
PERM=$(stat -c "%a" "$ENV_FILE")

if [ "$PERM" != "600" ]; then
    echo "⚠ WARNING: Recommended permissions for env file:"
    echo "chmod 600 $ENV_FILE"
fi

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

CELERY_SERVICE="rsmc-worker"
WRF_SERVICE="watch-wrf"

CELERY_UNIT="/etc/systemd/system/$CELERY_SERVICE.service"
WRF_UNIT="/etc/systemd/system/$WRF_SERVICE.service"

RUN_SCRIPT="$PROJECT_DIR/run.sh"

# --------------------------------------------------
# Ensure directories
# --------------------------------------------------
RUN_DIR="$PROJECT_DIR/run"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$RUN_DIR" "$LOG_DIR"

chown -R "$USER_NAME:$USER_NAME" "$RUN_DIR" "$LOG_DIR"

echo "✅ Created directories"

# --------------------------------------------------
# Create run.sh
# --------------------------------------------------
cat > "$RUN_SCRIPT" <<'EOL'
#!/bin/bash

BASE_DIR=$(dirname "$(realpath "$0")")

source "$BASE_DIR/venv/bin/activate"

cd "$BASE_DIR"

exec "$BASE_DIR/venv/bin/celery" \
     -A rsmc_config.config.celery worker \
     --loglevel=INFO \
     --concurrency=2 \
     --pidfile="$BASE_DIR/run/celery.pid"
EOL

chmod +x "$RUN_SCRIPT"
chown "$USER_NAME:$USER_NAME" "$RUN_SCRIPT"

echo "✅ Created $RUN_SCRIPT"

# --------------------------------------------------
# Celery Worker Service
# --------------------------------------------------
cat > "$CELERY_UNIT" <<EOL
[Unit]
Description=RSMC Celery Worker
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$PROJECT_DIR

EnvironmentFile=$ENV_FILE

ExecStart=$RUN_SCRIPT

Restart=always
RestartSec=5
LimitNOFILE=65535

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
EOL

echo "✅ Created $CELERY_UNIT"

# --------------------------------------------------
# WRF Watcher Service
# --------------------------------------------------
cat > "$WRF_UNIT" <<EOL
[Unit]
Description=WRF Output Watchdog Service
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$PROJECT_DIR

EnvironmentFile=$ENV_FILE

ExecStart=$PROJECT_DIR/venv/bin/python -u $PROJECT_DIR/watch_wrf.py

Restart=always
RestartSec=5
LimitNOFILE=65535

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
EOL

echo "✅ Created $WRF_UNIT"

# --------------------------------------------------
# Reload systemd
# --------------------------------------------------
echo "🔄 Reloading systemd..."
systemctl daemon-reload

# --------------------------------------------------
# Enable and start services
# --------------------------------------------------
echo "🚀 Enabling and starting services..."

systemctl enable --now $CELERY_SERVICE
systemctl enable --now $WRF_SERVICE

# --------------------------------------------------
# Show status
# --------------------------------------------------
echo ""
echo "✅ Services started successfully"
echo ""

systemctl status $CELERY_SERVICE --no-pager
echo ""
systemctl status $WRF_SERVICE --no-pager

echo ""
echo "📊 Logs:"
echo "journalctl -u $CELERY_SERVICE -f"
echo "journalctl -u $WRF_SERVICE -f"