#!/bin/bash
set -eo pipefail

# -------------------------------
# Directories and Remote Config
# -------------------------------
LOCAL_DIR="/home/haron/uploads/rsmc/2026"
SENT_DIR="$LOCAL_DIR/sent"
FAILED_DIR="$LOCAL_DIR/failed"

REMOTE_USER="nwp"
REMOTE_HOST="192.168.1.19"
REMOTE_DIR="/home/nwp/kmd_web/uploads/rsmc/2026/March/nwp_models_data"

LOG_FILE="/home/nwp/kmd_web/file_transfer.log"

POLL_INTERVAL=180       # seconds between checks when idle
STABILITY_WAIT=60      # seconds to wait for file to stabilize
MAX_LOG_SIZE=5000000   # 5MB

# -------------------------------
# Ensure directories exist
# -------------------------------
mkdir -p "$SENT_DIR" "$FAILED_DIR" "$(dirname "$LOG_FILE")"
touch "$LOG_FILE" 2>/dev/null || true

# -------------------------------
# Logging function (with rotation)
# -------------------------------
log() {
    # Rotate log if too big
    if [[ -f "$LOG_FILE" && $(stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]]; then
        mv "$LOG_FILE" "$LOG_FILE.old" 2>/dev/null || true
    fi

    echo "$(date '+%F %T') $1" >> "$LOG_FILE" 2>/dev/null || true
}
#echo "$(date '+%F %T') message"
# -------------------------------
# Validate local directory
# -------------------------------
if [[ ! -d "$LOCAL_DIR" ]]; then
    log "FATAL: Local directory does not exist: $LOCAL_DIR"
    exit 1
fi

log "Service started. Monitoring: $LOCAL_DIR"

# -------------------------------
# Main loop
# -------------------------------
while true; do

    # ---------------------------
    # Check remote connectivity
    # ---------------------------
    if ! ssh -o ConnectTimeout=5 ${REMOTE_USER}@${REMOTE_HOST} "echo ok" >/dev/null 2>&1; then
        log "ERROR: Cannot reach remote host ${REMOTE_HOST}"
        sleep 60
        continue
    fi

    # Ensure remote directory exists
    ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}" >/dev/null 2>&1 || true

    # ---------------------------
    # Get oldest file by time
    # ---------------------------
    FILE=$(find "$LOCAL_DIR" -maxdepth 1 -type f ! -name ".*" \
        ! -path "$SENT_DIR/*" ! -path "$FAILED_DIR/*" \
        -printf '%T@ %p\n' | sort -n | head -n 1 | cut -d' ' -f2-)

    if [[ -z "${FILE:-}" ]]; then
        sleep "$POLL_INTERVAL"
        continue
    fi

    BASENAME=$(basename "$FILE")
    log "Detected file: $BASENAME"

    # ---------------------------
    # Wait for file to stabilize
    # ---------------------------
    PREV_SIZE=-1
    while true; do
        CUR_SIZE=$(stat -c%s "$FILE" 2>/dev/null || echo 0)

        if [[ "$CUR_SIZE" -eq "$PREV_SIZE" && "$CUR_SIZE" -gt 0 ]]; then
            break
        fi

        PREV_SIZE="$CUR_SIZE"
        sleep "$STABILITY_WAIT"
    done

    log "File stabilized: $BASENAME (size: $CUR_SIZE bytes)"

    # ---------------------------
    # Transfer with retry
    # ---------------------------
    success=0

    for attempt in {1..5}; do
        if rsync -az --partial --inplace \
            --ignore-existing --mkpath \
            -e "ssh -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=5" \
            "$FILE" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"; then

            log "SUCCESS: $BASENAME"
            mv "$FILE" "$SENT_DIR/" 2>/dev/null || log "Warning: Failed to move $BASENAME to sent/"
            success=1
            break
        else
            log "Attempt $attempt failed for $BASENAME"
            sleep 20
        fi
    done

    # ---------------------------
    # Handle permanent failure
    # ---------------------------
    if [[ "$success" -eq 0 ]]; then
        log "FAILED permanently: $BASENAME"
        mv "$FILE" "$FAILED_DIR/" 2>/dev/null || log "Warning: Failed to move $BASENAME to failed/"
    fi

done
