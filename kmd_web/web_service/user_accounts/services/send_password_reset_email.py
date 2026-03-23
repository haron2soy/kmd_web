from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def send_password_reset_email(user_email, reset_url):
    subject = "Password Reset Request"

    text_content = (
        f"You requested a password reset.\n\n"
        f"Use the link below to reset your password:\n"
        f"{reset_url}\n\n"
        f"If you did not request this, ignore this email."
    )

    html_content = f"""
    <p>You requested a password reset.</p>
    <p>
        <a href="{reset_url}" 
           style="display:inline-block;
                  padding:10px 16px;
                  background:#1d4ed8;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:6px;">
            Reset Password
        </a>
    </p>
    <p>If you did not request this, ignore this email.</p>
    """

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user_email],
    )

    email_message.attach_alternative(html_content, "text/html")
    email_message.send(fail_silently=False)