#!/bin/bash

BASE_DIR=$(dirname "$(realpath "$0")")

source "$BASE_DIR/venv/bin/activate"

cd "$BASE_DIR"

exec "$BASE_DIR/venv/bin/celery" \
     -A rsmc_config.config.celery worker \
     --loglevel=INFO \
     --concurrency=2 \
     --pidfile="$BASE_DIR/run/celery.pid"
