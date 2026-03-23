import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import os
from .models import EventTable

@api_view(["GET"])
def get_event_table_data(request):
    year = request.GET.get("year")
    quarter = request.GET.get("quarter")

    if not year or not quarter:
        return Response({"error": "Missing parameters"}, status=400)

    try:
        year = int(year)
        quarter = int(quarter)
    except ValueError:
        return Response({"error": "Invalid parameters"}, status=400)

    event = EventTable.objects.filter(
        year=year,
        quarter=quarter,
        is_active=True
    ).first()

    if not event:
        return Response({"error": "Event table not found"}, status=404)

    file_path = os.path.join(settings.MEDIA_ROOT, event.file_path)

    if not os.path.exists(file_path):
        return Response({"error": "File missing on disk"}, status=404)

    # 🔑 Read with pandas
    try:
        file_ext = os.path.splitext(file_path)[1].lower()

        if file_ext == ".xls":
            df = pd.read_excel(file_path, engine="xlrd")  # old Excel format
        else:
            df = pd.read_excel(file_path, engine="openpyxl")  # modern Excel format
        #df = pd.read_excel(file_path)
    except Exception as e:
        return Response({"error": f"Failed to read Excel: {str(e)}"}, status=500)

    # Convert to JSON-friendly format
    data = df.fillna("").to_dict(orient="records")
    columns = list(df.columns)

    return Response({
        "columns": columns,
        "rows": data
    })