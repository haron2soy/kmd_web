from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.http import JsonResponse
import json

User = get_user_model()

@csrf_protect
@require_POST
def reset_password(request):
    """
    Resets user password using UID and token from the reset email.
    """
    try:
        data = json.loads(request.body)
        uid = data.get("uid")
        token = data.get("token")
        password = data.get("password")

        if not all([uid, token, password]):
            return JsonResponse({"detail": "Missing parameters."}, status=400)

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)

            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return JsonResponse({"detail": "Password successfully reset."})
            else:
                return JsonResponse({"detail": "Invalid or expired token."}, status=400)

        except User.DoesNotExist:
            return JsonResponse({"detail": "Invalid user."}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid request format."}, status=400)
    except Exception as e:
        return JsonResponse({"detail": "Unable to process request."}, status=500)