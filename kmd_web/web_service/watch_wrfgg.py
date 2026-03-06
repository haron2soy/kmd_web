# web_service/watch_wrf.py
import os
import time
import django
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rsmc_config.config.settings")
django.setup()

from nwp_models.tasks import process_new_wrf

WATCH_DIR = settings.WRF_DATA_DIR
GENERATED_DIR = "/home/haron/kmd/generated_maps"

# --------------------------
# Helper to wait until file is fully written
# --------------------------
def wait_for_complete_file(path, timeout=60):
    prev_size = -1
    for _ in range(timeout):
        if not os.path.exists(path):
            return False
        size = os.path.getsize(path)
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

        filename = os.path.basename(event.src_path)

        if filename.startswith("wrfout_d01"):
            if wait_for_complete_file(event.src_path):
                print(f"[watchdog] New WRF file detected: {event.src_path}")
                process_new_wrf.delay(event.src_path)

# --------------------------
# Scan for missing generated maps at startup
# --------------------------
def scan_for_missing_maps():
    print("[scanner] Scanning for unprocessed WRF files...")
    for filename in os.listdir(WATCH_DIR):
        if not filename.startswith("wrfout_d01"):
            continue

        nc_path = os.path.join(WATCH_DIR, filename)
        run_id = filename.replace("wrfout_", "")
        out_dir = os.path.join(GENERATED_DIR, run_id)

        if not os.path.exists(out_dir):
            print(f"[scanner] Missing generated maps for {run_id}, queueing task...")
            process_new_wrf.delay(nc_path)

# --------------------------
# Main watcher
# --------------------------
if __name__ == "__main__":
    # 1️⃣ Scan existing files
    scan_for_missing_maps()

    # 2️⃣ Start watchdog
    observer = Observer()
    observer.schedule(WRFHandler(), WATCH_DIR, recursive=False)
    observer.start()
    print("[watchdog] Watching for new WRF files...")

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
