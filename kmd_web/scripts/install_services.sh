#!/usr/bin/env bash

set -e

SERVICE_DIR="/etc/systemd/system"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Installing systemd services..."

echo "Linking Celery service..."
sudo ln -sf "$PROJECT_DIR/services/celery.service" \
"$SERVICE_DIR/celery.service"

echo "Linking WRF watcher service..."
sudo ln -sf "$PROJECT_DIR/services/wrf_watcher.service" \
"$SERVICE_DIR/wrf_watcher.service"

echo "Reloading systemd..."
sudo systemctl daemon-reload

echo "Enabling services..."
sudo systemctl enable celery
sudo systemctl enable wrf_watcher

echo "Starting services..."
sudo systemctl restart celery
sudo systemctl restart wrf_watcher

echo "------------------------------------"
echo "Services installed and running."
echo "------------------------------------"