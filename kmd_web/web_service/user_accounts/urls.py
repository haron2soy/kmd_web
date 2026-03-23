from django.urls import path
from .forgot_password import forgot_password
from .reset_password import reset_password
from .views import (
    csrf_token_view,
    login_view,
    logout_view,
    session_view,
    register_view,
    verify_email_view,
    resend_verification_view,

    
)

urlpatterns = [
    path("csrf/", csrf_token_view),
    path("login/", login_view),
    path("logout/", logout_view),
    path("session/", session_view),
    path("auth/register/", register_view),
    path("auth/forgot-password/", forgot_password),
    path("auth/reset-password/", reset_password),
    path("auth/verify-email/", verify_email_view),
    path("auth/verify-email/<uuid:token>/", verify_email_view),
    path("auth/verify-code/", verify_email_view),
    path("auth/resend-verification/", resend_verification_view),
]