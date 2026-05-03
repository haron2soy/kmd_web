import os
from pathlib import Path
from django.http import FileResponse, Http404, JsonResponse
from django.conf import settings

def download_file(request):
    file_path = request.GET.get("path")
    if not file_path:
        return JsonResponse({"error": "file path required"}, status=400)

    #full_path = Path(settings.STORAGE_BASE_DIR) / file_path
    #full_path = full_path.resolve()

    # Ensure file is inside STORAGE_BASE_DIR
    base_dir = Path(settings.STORAGE_BASE_DIR).resolve()

    try:
        full_path = (base_dir / file_path).resolve()
    except Exception:
        return JsonResponse({"error": "Invalid path"}, status=400)

    try:
        full_path.relative_to(base_dir)
    except ValueError:
        return JsonResponse({"error": "Unauthorized path"}, status=400)

    if not full_path.exists() or not full_path.is_file():
        raise Http404("File not found")

    # Extract year, month, day from numeric folder structure
    # Expect path like: rsmc/2026/May/may-19/filename.ext
    parts = full_path.parts  # ['rsmc','2026','May','may-19','file.doc']
    try:
        idx = parts.index("rsmc")
        year = parts[idx + 1]
        month = parts[idx + 2]
        day = parts[idx + 3]
    except IndexError:
        year, month, day = "unknown", "unknown", "00"

    original_name = full_path.name
    download_name = f"{year}-{month}-{day}_{original_name}"

    #print(f"Download requested: {full_path} as {download_name}")
    # Stream file safely
    f = open(full_path, "rb")
    response = FileResponse(f, as_attachment=True)
    response["Content-Disposition"] = f'attachment; filename="{download_name}"'
    return response