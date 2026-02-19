#web_service/watch_wrf.py
import os
import time
import django
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rsmc_config.config.settings")
django.setup()

from nwp_models.tasks import process_new_wrf

WATCH_DIR = settings.WRF_DATA_DIR

class WRFHandler(FileSystemEventHandler):
    def wait_for_complete_file(path, timeout=60):
    prev_size = -1
    for _ in range(timeout):
        size = os.path.getsize(path)
        if size == prev_size:
            return True
        prev_size = size
        time.sleep(1)
    return False

    def on_created(self, event):
        if event.is_directory:
            return

        filename = os.path.basename(event.src_path)

        if filename.startswith("wrfout_d01"):
            if wait_for_complete_file(event.src_path):
                print(f"New WRF file detected: {event.src_path}")
                process_new_wrf.delay(event.src_path)

observer = Observer()
observer.schedule(WRFHandler(), WATCH_DIR, recursive=False)
observer.start()

print("Watching for new WRF files...")

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:
    observer.stop()

observer.join()
