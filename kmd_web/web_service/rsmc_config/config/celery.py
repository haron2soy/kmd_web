#rsmc_config/config/celery.py
import os
from celery import Celery

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "rsmc_config.config.settings"
)

app = Celery("rsmc_config")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
