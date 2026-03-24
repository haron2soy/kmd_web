# users/services/send_password_setup_email.py
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
logger = logging.getLogger(__name__)

def send_password_reset_email(user, reset_url):
    subject = "Reset Your Password"
    recipient = [user.email]
    logger.info(f"[EMAIL] Preparing email | to={recipient}")
    html_content = f"""
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,Arial;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 0;">
            
            <table width="600" style="background:#ffffff;border-radius:12px;padding:30px;">
              
              <tr>
                <td align="center">
                  <h2 style="margin:0;color:#111827;">Regional Specialized Meteorological Center Nairobi</h2>
                  <p style="color:#6b7280;">Secure Account Access</p>
                </td>
              </tr>

              <tr>
                <td style="padding-top:20px;">
                  <h3 style="color:#111827;">Hello {user.first_name or user.username},</h3>

                  <p style="color:#374151;">
                    We received a request to reset your password.
                  </p>

                  <div style="text-align:center;margin:30px 0;">
                    <a href="{reset_url}" 
                       style="background:#2563eb;color:white;padding:14px 24px;
                              text-decoration:none;border-radius:8px;font-weight:600;">
                      Reset Password
                    </a>
                  </div>

                  <p style="color:#6b7280;">
                    This link will expire in <strong>24 hours</strong>.
                  </p>

                  <p style="color:#6b7280;font-size:13px;">
                    If you didn’t request this, you can safely ignore this email.
                  </p>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    email = EmailMultiAlternatives(
        subject,
        "Reset your password using the link provided.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )
    

    email.attach_alternative(html_content, "text/html")
    email.send()
    logger.info(f"[EMAIL] send_mail result | to={recipient}")