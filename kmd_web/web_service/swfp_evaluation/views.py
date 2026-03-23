import os
from django.conf import settings
from django.utils.timezone import now
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import QuarterlyReport
from .models import EventTable

@api_view(["GET"])
def get_quarterly_report(request):
    year = request.GET.get("year")
    quarter = request.GET.get("quarter")

    if not year or not quarter:
        return Response({"error": "Missing parameters"}, status=400)

    try:
        year = int(year)
        quarter = int(quarter)
    except ValueError:
        return Response({"error": "Invalid parameters"}, status=400)

    # 1️⃣ DB lookup
    report = QuarterlyReport.objects.filter(
        year=year,
        quarter=quarter,
        is_active=True
    ).first()

    if report:
        return Response({
            "file": report.get_file_url(),
            "year": year,
            "quarter": quarter
        })

    # 2️⃣ Filesystem fallback
    base_dir = os.path.join(
        settings.MEDIA_ROOT,
        "rsmc",
        str(year),
        f"quarter_{quarter}",
        "quarter-report"
    )
    #print("base url: year", year,'quarter:', quarter,"url:", base_dir)
    if not os.path.exists(base_dir):
        return Response({"error": "Directory not found"}, status=404)

    pdf_files = [f for f in os.listdir(base_dir) if f.endswith(".pdf")]

    if not pdf_files:
        return Response({"error": "Quarterly report not found"}, status=404)

    filename = pdf_files[0]
    # full path on disk
    full_path = os.path.join(base_dir, filename)

    # compute path relative to MEDIA_ROOT
    relative_path = os.path.relpath(full_path, settings.MEDIA_ROOT)
    print("relative path:", relative_path)
    #relative_path = f"rsmc/{year}/quarter_{quarter}/quarterlyreport/{filename}"

    # 3️⃣ Save to DB
    report = QuarterlyReport.objects.create(
        year=year,
        quarter=quarter,
        title=filename,
        file_path=relative_path,
        issue_date=now().date(),
        is_active=True
    )

    return Response({
        "file": report.get_file_url(),
        "year": year,
        "quarter": quarter
    })


@api_view(["GET"])
def get_event_table(request):
    year = request.GET.get("year")
    quarter = request.GET.get("quarter")

    if not year or not quarter:
        return Response({"error": "Missing parameters"}, status=400)

    try:
        year = int(year)
        quarter = int(quarter)
    except ValueError:
        return Response({"error": "Invalid parameters"}, status=400)

    # 1️⃣ DB lookup
    event = EventTable.objects.filter(
        year=year,
        quarter=quarter,
        is_active=True
    ).first()

    if event:
        return Response({
            "file": event.get_file_url(),
            "year": year,
            "quarter": quarter
        })

    # 2️⃣ Filesystem fallback
    base_dir = os.path.join(
        settings.MEDIA_ROOT,
        "rsmc",
        str(year),
        f"quarter_{quarter}",
        "event-table"
    )

    if not os.path.exists(base_dir):
        return Response({"error": "Directory not found"}, status=404)

    xls_files = [
        f for f in os.listdir(base_dir)
        if f.endswith(".xls") or f.endswith(".xlsx")
    ]

    if not xls_files:
        return Response({"error": "Event table not found"}, status=404)

    filename = xls_files[0]
    # full path on disk
    full_path = os.path.join(base_dir, filename)

    # compute path relative to MEDIA_ROOT
    relative_path = os.path.relpath(full_path, settings.MEDIA_ROOT)
    #relative_path = f"rsmc/{year}/quarter_{quarter}/eventtable/{filename}"

    # 3️⃣ Save to DB
    event = EventTable.objects.create(
        year=year,
        quarter=quarter,
        title=filename,
        file_path=relative_path,
        issue_date=now().date(),
        is_active=True
    )

    return Response({
        "file": event.get_file_url(),
        "year": year,
        "quarter": quarter
    })