from django.contrib import admin
from .models import Forecast, ForecastCategory

admin.site.register(Forecast)
admin.site.register(ForecastCategory)