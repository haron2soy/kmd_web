import os
import subprocess
import logging
from datetime import timedelta
from django.utils.timezone import now
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from forecasts.models import Forecast, ForecastCategory
import calendar

logger = logging.getLogger(__name__)

# -----------------------------
# Conversion utility
# -----------------------------
def convert_doc_to_pdf(input_path):
    """
    Convert .doc/.docx → .pdf if needed.
    Returns path to usable file (PDF preferred).
    """

    if not os.path.exists(input_path):
        logger.error(f"[convert] Input file missing: {input_path}")
        return input_path

    base, ext = os.path.splitext(input_path)
    ext = ext.lower()
    pdf_path = base + ".pdf"

    # ✅ Already converted
    if os.path.exists(pdf_path):
        return pdf_path

    # ✅ Only convert DOC/DOCX
    if ext not in [".doc", ".docx"]:
        return input_path

    libreoffice_path = getattr(settings, "LIBREOFFICE_BIN", "/usr/bin/soffice")

    try:
        result = subprocess.run(
            [
                libreoffice_path,
                "--headless",
                "--convert-to", "pdf",
                "--outdir", os.path.dirname(input_path),
                input_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=60,  # prevent hanging
            check=True,
        )

        # Debug logs (useful in Docker logs)
        logger.info(f"[convert] stdout: {result.stdout.decode(errors='ignore')}")
        logger.info(f"[convert] stderr: {result.stderr.decode(errors='ignore')}")

        if os.path.exists(pdf_path):
            return pdf_path

        logger.error(f"[convert] PDF not created: {pdf_path}")

    except subprocess.TimeoutExpired:
        logger.error(f"[convert] Timeout converting {input_path}")
    except subprocess.CalledProcessError as e:
        logger.error(f"[convert] Conversion failed: {e.stderr.decode(errors='ignore')}")
    except Exception as e:
        logger.exception(f"[convert] Unexpected error: {e}")

    # fallback
    return input_path


# -----------------------------
# Filename generators
# -----------------------------
def marine_daily_filename(day, month, year):
    return f"Daily_Marine_Forecast_valid_{day}_{month}_{year}.pdf"


def marine_seven_day_filename(day, month, year):
    today = now().date()
    start_date = today + timedelta(days=1)
    end_date = today + timedelta(days=7)

    start = f"{start_date.day:02d}_{start_date.month:02d}_{start_date.year}"
    end = f"{end_date.day:02d}_{end_date.month:02d}_{end_date.year}"

    return f"Seven_Day_Marine_Forecast_valid_{start}_to_{end}.pdf"


def easwfp_daily_filename(day, month, year):
    return f"Easwfp_Discussion_valid_{day}_{month}_{year}.pdf"


# -----------------------------
# Slug mapping
# -----------------------------
FILENAME_PATTERNS = {
    "short-discussion": lambda d, m, y: "RSMC_Guidance_Short_range_Discussion.doc",
    "medium-discussion": lambda d, m, y: "RSMC_Guidance_Medium_range_Discussion.doc",
    "medium-risktable": lambda d, m, y: "RSMC_Guidance_Medium_range_Prob_table.doc",
    "short-risktable": lambda d, m, y: "RSMC_Guidance_Short_range_Risk_table.doc",
    "marine-forecast-daily": marine_daily_filename,
    "marine-forecast-seven-days": marine_seven_day_filename,
    "easwfp-discussion-daily": easwfp_daily_filename,
}


# -----------------------------
# API endpoint
# -----------------------------
@api_view(["GET"])
def guidance_documents(request):
    slug = request.GET.get("slug")

    if not slug:
        return Response({"error": "Missing slug parameter"}, status=400)

    if slug not in FILENAME_PATTERNS:
        return Response(
            {"error": f"Invalid slug. Available: {', '.join(FILENAME_PATTERNS.keys())}"},
            status=400
        )

    today = now().date()
    year = str(today.year)
    month = calendar.month_name[today.month]
    day_folder = today.strftime("%b-%d").lower()
    daydigit = f"{today.day:02d}"

    # -----------------------------
    # 1️⃣ DB lookup (FAST PATH)
    # -----------------------------
    forecast = Forecast.objects.filter(
        content_type="document",
        slug=slug,
        issue_date=today,
        is_active=True
    ).first()

    if forecast:
        _, ext = os.path.splitext(forecast.file_path)

        return Response({
            "document": forecast.file_path,
            "url": f"{settings.MEDIA_URL}{forecast.file_path}",
            "slug": slug,
            "date": forecast.issue_date.strftime("%Y-%m-%d"),
            "filename": os.path.basename(forecast.file_path),
            "file_type": ext.lstrip(".").lower(),
        })

    # -----------------------------
    # 2️⃣ Filesystem lookup (FIXED)
    # -----------------------------
    base_path = os.path.join(
        settings.STORAGE_BASE_DIR,
        "rsmc",
        year,
        month,
        day_folder
    )

    filename = FILENAME_PATTERNS[slug](daydigit, month, year)
    full_path = os.path.join(base_path, filename)

    if not os.path.exists(full_path):
        logger.warning(f"[guidance] File not found: {full_path}")
        return Response({"error": "File not found."}, status=404)

    # -----------------------------
    # 3️⃣ Convert if needed
    # -----------------------------
    final_path = convert_doc_to_pdf(full_path)
    final_filename = os.path.basename(final_path)

    # -----------------------------
    # 4️⃣ Save to DB
    # -----------------------------
    category, _ = ForecastCategory.objects.get_or_create(
        slug="guidance",
        defaults={"name": "Guidance Documents"}
    )

    db_file_path = os.path.join("rsmc", year, month, day_folder, final_filename)

    forecast, _ = Forecast.objects.update_or_create(
        category=category,
        slug=slug,
        issue_date=today,
        defaults={
            "title": slug.replace("-", " ").title(),
            "file_path": db_file_path,
            "is_active": True,
        }
    )

    _, ext = os.path.splitext(db_file_path)

    return Response({
        "document": db_file_path,
        "url": f"{settings.MEDIA_URL}{db_file_path}",
        "slug": slug,
        "date": forecast.issue_date.strftime("%Y-%m-%d"),
        "filename": final_filename,
        "file_type": ext.lstrip(".").lower(),
    })