#rsmc_config/config/celery.py
import os
from celery import Celery

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "rsmc_config.config.prod"
)

app = Celery("rsmc_config.config")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

CELERY_BEAT_SCHEDULE = {
    "reconcile-wrf": {
        "task": "nwp_models.tasks.reconcile_wrf_outputs",
        "schedule": 300.0,  # every 5 minutes
    },
}