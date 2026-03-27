# user_accounts/middleware.py

from django.conf import settings
from datetime import timedelta
from django.utils.timezone import now
from django.utils.dateparse import parse_datetime
from django.core.cache import cache
CURRENT_SESSION_VERSION = cache.get("session_version", 1)

CURRENT_SESSION_VERSION = getattr(settings, "SESSION_VERSION", 1)
SESSION_TIMEOUT = timedelta(minutes=60)

class SessionVersionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if request.user.is_authenticated:
            session_version = request.session.get("session_version")

            if session_version is None:
                request.session["session_version"] = CURRENT_SESSION_VERSION
            elif session_version != CURRENT_SESSION_VERSION:
                request.session.flush()

        return self.get_response(request)
        


class SessionTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if request.user.is_authenticated:
            last_seen = request.session.get("last_seen")

            if last_seen:
                last_seen = parse_datetime(last_seen)

                if last_seen and now() - last_seen > SESSION_TIMEOUT:
                    request.session.flush()
                else:
                    request.session["last_seen"] = now().isoformat()
            else:
                request.session["last_seen"] = now().isoformat()

        return self.get_response(request)