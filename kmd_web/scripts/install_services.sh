#!/usr/bin/env bash

USER_NAME=$(whoami)

SERVICE_DIR="/etc/systemd/system"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "------------------------------------"
echo "Installing systemd services"
echo "Project directory: $PROJECT_DIR"
echo "------------------------------------"

echo "Linking Celery service..."
sudo ln -sf "$PROJECT_DIR/services/celery.service" \
"$SERVICE_DIR/celery@.service"

echo "Reloading systemd..."
sudo systemctl daemon-reload

echo "Enabling services..."
sudo systemctl enable celery@$USER_NAME.service

echo "Starting services..."
sudo systemctl restart celery@$USER_NAME.service

echo "------------------------------------"
echo "Services installed and running"
echo ""
echo "Check status with:"
echo "  systemctl status celery@$USER_NAME"
echo "------------------------------------"