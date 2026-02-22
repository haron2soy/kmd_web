import textract
from django.http import JsonResponse
from django.views import View

class ReadDocView(View):
    def get(self, request):
        file_path = request.GET.get("file")

        if not file_path:
            return JsonResponse({"error": "No file provided"}, status=400)

        try:
            text = textract.process(file_path).decode("utf-8")

            return JsonResponse({
                "content": text
            })

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=500)