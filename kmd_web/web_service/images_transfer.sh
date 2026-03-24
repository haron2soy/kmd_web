#!/bin/bash
set -u  # avoid exit on errors for debugging

# ================= CONFIG =================
LOCAL_DIR="/home/haron/uploads/rsmc/2026/march/mar-17"
SENT_DIR="$LOCAL_DIR/sent"
FAILED_DIR="$LOCAL_DIR/failed"

REMOTE_USER="nwp"
REMOTE_HOST="192.168.1.19"
REMOTE_BASE_DIR="/home/nwp/kmd_web/uploads/rsmc"

LOG_FILE="$HOME/image_sync.log"

mkdir -p "$SENT_DIR" "$FAILED_DIR"

log() {
    echo "$(date '+%F %T') $1" | tee -a "$LOG_FILE"
}

# ================= REMOTE PATH =================
get_remote_path() {
    YEAR=$(date +%Y)
    MONTH=$(date +%B)
    DATE_PART=$(date +%F)
    HOUR=$(date +%H)

    FOLDER="d01_${DATE_PART}_${HOUR}:00:00"

    echo "$REMOTE_BASE_DIR/$YEAR/$MONTH/eawrf_maps/$FOLDER"
}

# ================= TRANSFER FUNCTION =================
transfer_file() {
    local file="$1"
    FULL_PATH="$LOCAL_DIR/$file"

    [[ -f "$FULL_PATH" ]] || return

    log "Processing: $file"

    REMOTE_DIR=$(get_remote_path)

    log "Creating remote dir: $REMOTE_DIR"

    ssh -o ConnectTimeout=5 -o BatchMode=yes \
        "${REMOTE_USER}@${REMOTE_HOST}" \
        "mkdir -p '$REMOTE_DIR'" || {
        log "ERROR: SSH mkdir failed"
        mv "$FULL_PATH" "$FAILED_DIR/"
        return
    }

    log "Uploading: $file → $REMOTE_DIR"

    if rsync -avz \
        -e "ssh -o ConnectTimeout=5 -o BatchMode=yes" \
        "$FULL_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"; then

        log "SUCCESS: $file"
        mv "$FULL_PATH" "$SENT_DIR/"
    else
        log "FAILED: $file"
        mv "$FULL_PATH" "$FAILED_DIR/"
    fi
}

# ================= PROCESS EXISTING FILES =================
log "Processing existing files..."

for f in "$LOCAL_DIR"/*; do
    file=$(basename "$f")

    [[ "$file" =~ \.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$ ]] || continue
    transfer_file "$file"
done

# ================= WATCH =================
log "Watching directory: $LOCAL_DIR"

inotifywait -m -e close_write -e moved_to -e create --format '%f' "$LOCAL_DIR" | while read file; do
    [[ "$file" =~ \.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$ ]] || continue
    sleep 1
    transfer_file "$file"
done
