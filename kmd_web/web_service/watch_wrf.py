# web_service/watch_wrf.py

import os
import time
import django
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --------------------------
# Django setup
# --------------------------
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rsmc_config.config.prod")
django.setup()

from django.conf import settings
from nwp_models.tasks import process_new_wrf

# --------------------------
# Directories
# --------------------------
WATCH_DIR = Path(settings.WRF_DATA_DIR)
GENERATED_DIR = Path(settings.GENERATED_MAPS_DIR)

# --------------------------
# Track processed files (runtime lock)
# --------------------------
processed_files = set()

# --------------------------
# Helper to wait until file is fully written
# --------------------------
def wait_for_complete_file(path: Path, timeout=60):
    prev_size = -1
    for _ in range(timeout):
        if not path.exists():
            return False
        size = path.stat().st_size
        if size == prev_size:
            return True
        prev_size = size
        time.sleep(1)
    return False

# --------------------------
# Watchdog handler
# --------------------------
class WRFHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        file_path = Path(event.src_path)
        filename = file_path.name

        if not filename.startswith("wrfout_d01"):
            return
        if filename.endswith((".tmp", ".part")):
            return

        # Skip if already queued or processed
        if file_path in processed_files:
            return

        if wait_for_complete_file(file_path):
            print(f"[watchdog] New WRF file detected: {file_path}")
            processed_files.add(file_path)
            process_new_wrf.delay(str(file_path))

# --------------------------
# Scan for missing generated maps at startup
# --------------------------
def scan_for_missing_maps():
    print("[scanner] Scanning for unprocessed WRF files...")
    if not WATCH_DIR.exists():
        print(f"[scanner] WATCH_DIR does not exist: {WATCH_DIR}")
        return

    for file_path in WATCH_DIR.iterdir():
        if not file_path.name.startswith("wrfout_d01"):
            continue

        run_id = file_path.name.replace("wrfout_", "")
        out_dir = GENERATED_DIR / run_id

        if not out_dir.exists():
            if file_path not in processed_files:
                print(f"[scanner] Missing maps for {run_id}, queueing task...")
                processed_files.add(file_path)
                process_new_wrf.delay(str(file_path))

# --------------------------
# Main watcher
# --------------------------
if __name__ == "__main__":
    # Ensure directories exist
    WATCH_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    # 1️⃣ Scan existing files
    scan_for_missing_maps()

    # 2️⃣ Start watchdog observer
    observer = Observer()
    observer.schedule(WRFHandler(), str(WATCH_DIR), recursive=False)
    observer.start()

    print(f"[watchdog] Watching directory: {WATCH_DIR}")

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()