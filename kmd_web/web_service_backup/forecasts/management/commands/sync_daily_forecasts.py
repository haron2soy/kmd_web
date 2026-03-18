from django.core.management.base import BaseCommand
from forecasts.services.sync import sync_today


class Command(BaseCommand):
    help = "Sync today's uploaded RSMC forecast into database"

    def handle(self, *args, **kwargs):
        synced = sync_today()

        if synced:
            self.stdout.write(self.style.SUCCESS("Forecast sync complete."))
        else:
            self.stdout.write(self.style.WARNING("No folder found for today."))