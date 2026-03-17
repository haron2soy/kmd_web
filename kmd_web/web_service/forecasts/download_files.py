import os
from pathlib import Path
from django.http import FileResponse, Http404, JsonResponse
from django.conf import settings

def download_file(request):
    file_path = request.GET.get("path")
    if not file_path:
        return JsonResponse({"error": "file path required"}, status=400)

    # Normalize path to prevent directory traversal
    safe_path = Path(settings.MEDIA_ROOT) / Path(file_path).name
    full_path = Path(settings.MEDIA_ROOT) / file_path
    full_path = full_path.resolve()

    # Ensure file is inside MEDIA_ROOT
    if not str(full_path).startswith(str(Path(settings.MEDIA_ROOT).resolve())):
        return JsonResponse({"error": "Invalid file path"}, status=400)

    if not full_path.exists() or not full_path.is_file():
        raise Http404("File not found")

    # Extract year, month, day from path if possible
    parts = full_path.parts[-5:]  # ['rsmc','2026','march','mar-17','file.doc']
    try:
        year = parts[1]
        month = parts[2]
        day = parts[3].split("-")[-1]
    except IndexError:
        year, month, day = "unknown", "unknown", "00"

    original_name = full_path.name
    download_name = f"{year}-{month}-{day}-{original_name}"

    # Use context manager to ensure file is properly handled
    response = FileResponse(open(full_path, "rb"), as_attachment=True)
    response["Content-Disposition"] = f'attachment; filename="{download_name}"'

    return response