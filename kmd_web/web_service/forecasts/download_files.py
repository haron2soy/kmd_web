import os
from pathlib import Path
from django.http import FileResponse, Http404, JsonResponse
from django.conf import settings

def download_file(request):
    file_path = request.GET.get("path")
    if not file_path:
        return JsonResponse({"error": "file path required"}, status=400)

    full_path = Path(settings.STORAGE_BASE_DIR) / file_path
    full_path = full_path.resolve()

    # Ensure file is inside STORAGE_BASE_DIR
    if not str(full_path).startswith(str(Path(settings.STORAGE_BASE_DIR).resolve())):
        return JsonResponse({"error": "Invalid file path"}, status=400)

    if not full_path.exists() or not full_path.is_file():
        raise Http404("File not found")

    # Extract year, month, day from numeric folder structure
    # Expect path like: rsmc/2026/03/19/filename.ext
    parts = full_path.parts[-5:]  # ['rsmc','2026','03','19','file.doc']
    try:
        year = parts[1]
        month = parts[2]
        day = parts[3]
    except IndexError:
        year, month, day = "unknown", "unknown", "00"

    original_name = full_path.name
    download_name = f"{year}-{month}-{day}-{original_name}"

    # Stream file safely
    with open(full_path, "rb") as f:
        response = FileResponse(f, as_attachment=True)
        response["Content-Disposition"] = f'attachment; filename="{download_name}"'

    return response