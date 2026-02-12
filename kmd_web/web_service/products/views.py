# Create your views here.
# products/views.py
from django.shortcuts import render


from django.shortcuts import redirect

def noaa_redirect(request):
    return redirect("https://www.cpc.ncep.noaa.gov/products/international/eafrica/eafrica.shtml")
# api/views.py
from django.http import JsonResponse

def noaa_ncep(request):
    data = {
        "name": "NOAA NCEP African Desk",
        "description": "Global forecast products for Africa",
        "provider": "NOAA",
    }
    return JsonResponse(data)
